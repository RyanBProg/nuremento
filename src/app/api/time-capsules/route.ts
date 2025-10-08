import { auth } from "@clerk/nextjs/server";
import {
  differenceInCalendarDays,
  isBefore,
  isValid,
  startOfDay,
} from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { timeCapsules } from "@/db/schema";

const MAX_FUTURE_DAYS = 183; // ~6 months

function parseAndValidateOpenDate(raw: unknown) {
  if (typeof raw !== "string") {
    return { error: "openOn must be an ISO date string." } as const;
  }

  const openDate = new Date(raw);

  if (!isValid(openDate)) {
    return { error: "openOn is not a valid date." } as const;
  }

  const now = new Date();
  const earliestAllowed = startOfDay(now);

  if (openDate < earliestAllowed) {
    return { error: "openOn must be today or later." } as const;
  }

  if (differenceInCalendarDays(openDate, now) > MAX_FUTURE_DAYS) {
    return { error: "openOn cannot be more than six months away." } as const;
  }

  return { date: openDate } as const;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(timeCapsules)
    .where(eq(timeCapsules.clerkId, userId));

  if (Number(count ?? 0) >= 10) {
    return NextResponse.json(
      { error: "You have reached the maximum of 10 time capsules." },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { title?: unknown }).title !== "string" ||
    typeof (body as { message?: unknown }).message !== "string" ||
    typeof (body as { openOn?: unknown }).openOn !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required fields: title, message, openOn." },
      { status: 400 }
    );
  }

  const { title, message, openOn } = body as {
    title: string;
    message: string;
    openOn: string;
  };

  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (!trimmedTitle) {
    return NextResponse.json(
      { error: "Please provide a title for your time capsule." },
      { status: 400 }
    );
  }

  if (!trimmedMessage) {
    return NextResponse.json(
      { error: "Please provide a message for your time capsule." },
      { status: 400 }
    );
  }

  const result = parseAndValidateOpenDate(openOn);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const openDate = result.date;

  const [record] = await db
    .insert(timeCapsules)
    .values({
      clerkId: userId,
      title: trimmedTitle,
      message: trimmedMessage,
      openOn: openDate,
    })
    .returning();

  return NextResponse.json(
    {
      capsule: {
        id: record.id,
        title: record.title,
        message: record.message,
        openOn: record.openOn,
        openedAt: record.openedAt,
        createdAt: record.createdAt,
      },
    },
    { status: 201 }
  );
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const capsuleId = searchParams.get("id");

  if (!capsuleId) {
    return NextResponse.json(
      { error: "Missing time capsule id." },
      { status: 400 }
    );
  }

  const [capsule] = await db
    .select()
    .from(timeCapsules)
    .where(and(eq(timeCapsules.id, capsuleId), eq(timeCapsules.clerkId, userId)))
    .limit(1);

  if (!capsule) {
    return NextResponse.json(
      { error: "Time capsule not found." },
      { status: 404 }
    );
  }

  const now = new Date();

  if (isBefore(now, capsule.openOn)) {
    return NextResponse.json(
      {
        error: "This time capsule is still locked.",
        openOn: capsule.openOn,
      },
      { status: 403 }
    );
  }

  const openedAt = new Date();

  await db
    .delete(timeCapsules)
    .where(and(eq(timeCapsules.id, capsuleId), eq(timeCapsules.clerkId, userId)));

  return NextResponse.json(
    {
      capsule: {
        id: capsule.id,
        title: capsule.title,
        message: capsule.message,
        openOn: capsule.openOn,
        openedAt,
      },
    },
    { status: 200 }
  );
}
