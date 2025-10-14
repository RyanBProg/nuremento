import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { MemoriesList } from "@/components/memories/MemoriesList";
import { resolveThumbnailUrl } from "@/lib/aws/resolveThumbnailUrl";
import { formatDate } from "@/lib/utils";
import MemoryFormModal from "@/components/memory-form/MemoryFormModal";

export const metadata: Metadata = {
  title: "Your Memories | Nuremento",
  description:
    "Browse, edit, and organize the memories you've captured inside Nuremento.",
  openGraph: {
    title: "Your Memories | Nuremento",
    description:
      "Browse, edit, and organize the memories you've captured inside Nuremento.",
  },
  twitter: {
    card: "summary",
    title: "Your Memories | Nuremento",
    description:
      "Browse, edit, and organize the memories you've captured inside Nuremento.",
  },
};

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
    <div className="flex-1 flex flex-col">
      <section className="border-b">
        <div className="mx-auto max-w-6xl py-10 px-4 xs:px-8 flex flex-col items-center gap-3">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Your Memories</h1>
            <p className="text-sm text-neutral-600">
              Browse, edit, or remove your saved memories.
            </p>
          </div>
          <MemoryFormModal mode="create" />
        </div>
      </section>

      <MemoriesList initialMemories={memoriesWithThumbnails} />
    </div>
  );
}
