import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { memories, type MemoryAsset } from "@/db/schema";
import { createSignedUrlForKey } from "@/lib/storage";

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

async function resolveCoverThumbnailUrl(memory: typeof memories.$inferSelect) {
  if (!memory.coverImageKey) {
    return null;
  }

  const coverAsset = (memory.media as MemoryAsset[]).find(
    (asset) => asset.key === memory.coverImageKey,
  );

  const thumbnailKey = coverAsset?.thumbnailKey ?? coverAsset?.key;

  if (!thumbnailKey) {
    return null;
  }

  try {
    return await createSignedUrlForKey(thumbnailKey);
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
      thumbnailUrl: await resolveCoverThumbnailUrl(memory),
    })),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Your Memories</h1>
        <p className="text-sm text-muted-foreground">
          Browse everything you’ve saved. Edit or delete actions are coming soon.
        </p>
      </header>

      {memoriesWithThumbnails.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          You haven’t created any memories yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {memoriesWithThumbnails.map((memory) => (
            <article
              key={memory.id}
              className="flex flex-col overflow-hidden rounded-lg border shadow-sm"
            >
              {memory.thumbnailUrl ? (
                <img
                  src={memory.thumbnailUrl}
                  alt={memory.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No cover photo
                </div>
              )}

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium">{memory.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(memory.occurredOn)}
                    {memory.location ? ` • ${memory.location}` : ""}
                  </p>
                  {memory.mood ? (
                    <p className="text-xs text-muted-foreground">Mood: {memory.mood}</p>
                  ) : null}
                  {memory.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {memory.description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                    disabled
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-destructive px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                    disabled
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
