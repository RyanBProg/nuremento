import { createHash } from "node:crypto";
import { asc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { resolveThumbnailUrl } from "@/lib/aws/resolveThumbnailUrl";
import { formatDate } from "@/lib/utils";
import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";
import { MemoryCard } from "@/components/memory/MemoryCard";

type DailyMemoryCardProps = {
  userId: string;
};

type DailyMemoryResult =
  | {
      id: string;
      title: string;
      description: string | null;
      mood: string | null;
      location: string | null;
      occurredOnDisplay: string;
      thumbnailUrl: string | null;
    }
  | null;

function buildSeed(userId: string, now = new Date()) {
  const isoDate = now.toISOString().slice(0, 10);
  return `${userId}-${isoDate}`;
}

function pickIndex(length: number, seed: string) {
  if (length <= 0) {
    return 0;
  }

  const hash = createHash("sha256").update(seed).digest("hex");
  const numericValue = Number.parseInt(hash.slice(0, 8), 16);

  return numericValue % length;
}

function buildSubtitle(memory: NonNullable<DailyMemoryResult>) {
  const parts: string[] = [];

  if (memory.occurredOnDisplay && memory.occurredOnDisplay !== "—") {
    parts.push(memory.occurredOnDisplay);
  }

  if (memory.location) {
    parts.push(memory.location);
  }

  if (memory.mood) {
    parts.push(memory.mood);
  }

  return parts.join(" • ") || "Memory of the day";
}

async function getDailyMemory(userId: string): Promise<DailyMemoryResult> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(memories)
    .where(eq(memories.clerkId, userId));

  const total = Number(count ?? 0);

  if (!total) {
    return null;
  }

  const index = pickIndex(total, buildSeed(userId));

  const [record] = await db
    .select()
    .from(memories)
    .where(eq(memories.clerkId, userId))
    .orderBy(asc(memories.createdAt), asc(memories.id))
    .limit(1)
    .offset(index);

  if (!record) {
    return null;
  }

  const thumbnailUrl = await resolveThumbnailUrl(record);

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    mood: record.mood,
    location: record.location,
    occurredOnDisplay: formatDate(record.occurredOn),
    thumbnailUrl,
  };
}

export async function DailyMemoryCard({ userId }: DailyMemoryCardProps) {
  const memory = await getDailyMemory(userId);

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">Memory of the day</h2>
        <p className="text-sm text-neutral-600">
          A moment picked just for you to revisit today.
        </p>
      </header>

      {memory ? (
        <MemoryCard
          title={memory.title}
          subtitle={buildSubtitle(memory)}
          description={memory.description}
          thumbnailUrl={memory.thumbnailUrl}
        />
      ) : (
        <MemoryCard
          title="Capture your first memory"
          subtitle="No memories yet"
          description="You haven't logged any memories yet. Record your first one to start building a daily reflection habit."
          actions={<CreateMemoryButton />}
        />
      )}
    </section>
  );
}
