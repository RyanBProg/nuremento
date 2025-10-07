import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { resolveThumbnailUrl } from "@/lib/aws/resolveThumbnailUrl";
import { formatDate } from "@/lib/utils";
import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";
import { MemoryCard } from "@/components/memory/MemoryCard";

type RecentMemoriesSectionProps = {
  userId: string;
  limit?: number;
};

type RecentMemory = {
  id: string;
  title: string;
  description: string | null;
  mood: string | null;
  location: string | null;
  occurredOnDisplay: string;
  thumbnailUrl: string | null;
};

function buildSubtitle(memory: RecentMemory) {
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

  return parts.join(" • ") || "Recent memory";
}

async function getRecentMemories(
  userId: string,
  limit: number
): Promise<RecentMemory[]> {
  const rows = await db
    .select()
    .from(memories)
    .where(eq(memories.clerkId, userId))
    .orderBy(desc(memories.createdAt))
    .limit(limit);

  return Promise.all(
    rows.map(async (memory) => ({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      mood: memory.mood,
      location: memory.location,
      occurredOnDisplay: formatDate(memory.occurredOn),
      thumbnailUrl: await resolveThumbnailUrl(memory),
    }))
  );
}

export async function RecentMemoriesSection({
  userId,
  limit = 3,
}: RecentMemoriesSectionProps) {
  const memories = await getRecentMemories(userId, limit);
  const hasMemories = memories.length > 0;

  return (
    <section className="bg-white">
      <div className="py-20 lg:py-44 px-0 lg:px-8 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg md:text-2xl font-semibold">
              Recent memories
            </h2>
            <p className="text-sm text-neutral-600">
              Catch up on the latest moments you&apos;ve captured.
            </p>
          </div>
          <Link href="/dashboard/memories" className="button-border self-start">
            View all memories
          </Link>
        </div>

        {hasMemories ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                title={memory.title}
                subtitle={buildSubtitle(memory)}
                description={memory.description}
                thumbnailUrl={memory.thumbnailUrl}
              />
            ))}
          </div>
        ) : (
          <MemoryCard
            title="No recent memories yet"
            description="Once you start logging memories, your most recent entries will show up here for easy access."
            actions={<CreateMemoryButton />}
          />
        )}
      </div>
    </section>
  );
}
