import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { MemoriesList } from "./MemoriesList";
import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";
import { resolveThumbnailUrl } from "@/lib/aws/resolveThumbnailUrl";
import { formatDate } from "@/lib/utils";

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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Your Memories</h1>
          <p className="text-sm text-neutral-600">
            Browse, edit, or remove your saved memories.
          </p>
        </div>
        <CreateMemoryButton />
      </header>

      <MemoriesList initialMemories={memoriesWithThumbnails} />
    </div>
  );
}
