import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { createSignedUrlForKey } from "@/lib/storage";

import { MemoriesList } from "./MemoriesList";

function formatDate(value: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

async function resolveThumbnailUrl(memory: typeof memories.$inferSelect) {
  const key = memory.imageThumbnailKey ?? memory.imageKey;

  if (!key) {
    return null;
  }

  try {
    return await createSignedUrlForKey(key);
  } catch (error) {
    console.error("Failed to create signed URL for thumbnail", error);
    return null;
  }
}

export default async function MemoriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const rows = await db
    .select()
    .from(memories)
    .where(eq(memories.clerkId, userId))
    .orderBy(desc(memories.createdAt));

  const memoriesWithThumbnails = await Promise.all(
    rows.map(async (memory) => ({
      ...memory,
      thumbnailUrl: await resolveThumbnailUrl(memory),
      occurredOnDisplay: formatDate(memory.occurredOn),
    }))
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Your Memories</h1>
        <p className="text-sm text-muted-foreground">
          Browse, edit, or remove your saved memories.
        </p>
      </header>

      <MemoriesList initialMemories={memoriesWithThumbnails} />
    </div>
  );
}
