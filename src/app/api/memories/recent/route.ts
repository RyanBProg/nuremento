import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { resolveThumbnailUrl } from "@/lib/aws/resolveThumbnailUrl";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";

function resolveLimit(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("limit");

  if (!raw) {
    return 3;
  }

  const parsed = Number.parseInt(raw, 10);

  if (Number.isNaN(parsed)) {
    return 3;
  }

  return Math.min(Math.max(parsed, 1), 12);
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = resolveLimit(request);

  const rows = await db
    .select()
    .from(memories)
    .where(eq(memories.clerkId, userId))
    .orderBy(desc(memories.createdAt))
    .limit(limit);

  const payload = await Promise.all(
    rows.map(async (memory) => ({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      mood: memory.mood,
      location: memory.location,
      occurredOn: memory.occurredOn,
      occurredOnDisplay: formatDate(memory.occurredOn),
      thumbnailUrl: await resolveThumbnailUrl(memory),
    }))
  );

  return NextResponse.json({ memories: payload });
}
