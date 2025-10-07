import { createHash } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { resolveThumbnailUrl } from "@/lib/aws/resolveThumbnailUrl";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";

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

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(memories)
    .where(eq(memories.clerkId, userId));

  const total = Number(count ?? 0);

  if (total === 0) {
    return NextResponse.json({ memory: null });
  }

  const index = pickIndex(total, buildSeed(userId));

  const [memory] = await db
    .select()
    .from(memories)
    .where(eq(memories.clerkId, userId))
    .orderBy(asc(memories.createdAt), asc(memories.id))
    .limit(1)
    .offset(index);

  if (!memory) {
    return NextResponse.json({ memory: null });
  }

  const thumbnailUrl = await resolveThumbnailUrl(memory);

  return NextResponse.json({
    memory: {
      id: memory.id,
      title: memory.title,
      description: memory.description,
      mood: memory.mood,
      location: memory.location,
      occurredOn: memory.occurredOn,
      occurredOnDisplay: formatDate(memory.occurredOn),
      thumbnailUrl,
    },
  });
}
