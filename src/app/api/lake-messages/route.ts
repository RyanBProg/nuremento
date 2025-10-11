import { auth } from "@clerk/nextjs/server";
import { format, startOfDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import z from "zod";

import { db } from "@/db/client";
import { lakeMessages, lakeMessage } from "@/db/schema";
import { lakeMessageData } from "@/lib/zod/schemas";

export const runtime = "nodejs";

type LakeMemoryRow = typeof lakeMessages.$inferSelect;

function normalizeDateColumn(value: unknown) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return format(value, "yyyy-MM-dd");
  }

  return null;
}

function getTodayKey() {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

function pickDeterministicMemory(
  items: LakeMemoryRow[],
  userId: string,
  dayKey: string
) {
  const hash = createHash("sha256").update(`${userId}:${dayKey}`).digest();
  const index = hash.readUInt32BE(0) % items.length;

  return items[index];
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { title, message } = lakeMessageData.parse(body);

    const [record] = await db
      .insert(lakeMessages)
      .values({
        clerkId: userId,
        title,
        message,
      })
      .returning();

    return NextResponse.json(
      {
        memory: {
          id: record.id,
          title: record.title,
          message: record.message,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error("Unexpected error creating lake memory", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayKey = getTodayKey();

    const [status] = await db
      .select()
      .from(lakeMessage)
      .where(eq(lakeMessage.clerkId, userId))
      .limit(1);

    const lastOpenedOn = normalizeDateColumn(status?.lastOpenedOn);

    if (lastOpenedOn === todayKey) {
      return NextResponse.json({ memory: null }, { status: 200 });
    }

    const memoriesForUser = await db
      .select()
      .from(lakeMessages)
      .where(eq(lakeMessages.clerkId, userId))
      .orderBy(asc(lakeMessages.createdAt), asc(lakeMessages.id));

    if (memoriesForUser.length === 0) {
      return NextResponse.json({ memory: null }, { status: 200 });
    }

    const chosen = pickDeterministicMemory(memoriesForUser, userId, todayKey);

    await db
      .insert(lakeMessage)
      .values({
        clerkId: userId,
        lastOpenedOn: todayKey,
      })
      .onConflictDoUpdate({
        target: lakeMessage.clerkId,
        set: {
          lastOpenedOn: todayKey,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json(
      {
        memory: {
          id: chosen.id,
          title: chosen.title,
          message: chosen.message,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error retrieving lake memory", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json(
        { error: "Missing lake memory id." },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(lakeMessages)
      .where(
        and(eq(lakeMessages.id, memoryId), eq(lakeMessages.clerkId, userId))
      )
      .returning({ id: lakeMessages.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Lake memory not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 204 });
  } catch (err) {
    console.error("Unexpected error deleting lake memory", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
