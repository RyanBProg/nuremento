import { auth } from "@clerk/nextjs/server";
import { format, startOfDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import z from "zod";

import { db } from "@/db/client";
import { lakeNotes } from "@/db/schema";
import { lakeMessageData } from "@/lib/zod/schemas";

export const runtime = "nodejs";

type LakeNoteRow = typeof lakeNotes.$inferSelect;

function getTodayDate() {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

function pickDeterministicNote(
  items: LakeNoteRow[],
  userId: string,
  dayKey: string
): LakeNoteRow {
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

    const body = await req.json();
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { title, message } = lakeMessageData.parse(body);

    const [record] = await db
      .insert(lakeNotes)
      .values({
        clerkId: userId,
        title,
        message,
      })
      .returning();

    return NextResponse.json(
      {
        note: {
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

    console.error("Unexpected error creating lake note", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayDate = getTodayDate();

    const notesForUser = await db
      .select()
      .from(lakeNotes)
      .where(eq(lakeNotes.clerkId, userId))
      .orderBy(asc(lakeNotes.createdAt), asc(lakeNotes.id));

    // [Todo] limit the return amount for notesForUser

    if (notesForUser.length === 0) {
      return NextResponse.json({ note: null }, { status: 200 });
    }

    const chosen = pickDeterministicNote(notesForUser, userId, todayDate);

    return NextResponse.json(
      {
        note: {
          id: chosen.id,
          title: chosen.title,
          message: chosen.message,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error retrieving lake note", err);
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
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json(
        { error: "Missing lake note id." },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(lakeNotes)
      .where(and(eq(lakeNotes.id, noteId), eq(lakeNotes.clerkId, userId)))
      .returning({ id: lakeNotes.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Lake note not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: 204 });
  } catch (err) {
    console.error("Unexpected error deleting lake note", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
