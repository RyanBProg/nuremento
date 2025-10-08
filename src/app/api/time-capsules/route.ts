import { auth } from "@clerk/nextjs/server";
import {
  differenceInCalendarDays,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { timeCapsules } from "@/db/schema";
import { timeCapsuleData } from "@/lib/zod/schemas";
import z from "zod";

const MAX_FUTURE_DAYS = 183; // ~6 months

function parseAndValidateOpenDate(raw: unknown) {
  if (typeof raw !== "string") {
    return { error: "openOn must be an ISO date string." } as const;
  }

  const openDate = parseISO(raw);

  if (!isValid(openDate)) {
    return { error: "openOn is not a valid date." } as const;
  }

  const now = new Date();
  const earliestAllowed = startOfDay(now);

  if (isBefore(openDate, earliestAllowed)) {
    return { error: "openOn must be today or later." } as const;
  }

  if (differenceInCalendarDays(openDate, now) > MAX_FUTURE_DAYS) {
    return { error: "openOn cannot be more than six months away." } as const;
  }

  return { date: openDate } as const;
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { title, message, openOn } = timeCapsuleData.parse(body);

    const result = parseAndValidateOpenDate(openOn);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const [record] = await db
      .insert(timeCapsules)
      .values({
        clerkId: userId,
        title: title,
        message: message,
        openOn: openOn,
      })
      .returning();

    return NextResponse.json(
      {
        capsule: {
          id: record.id,
          title: record.title,
          message: record.message,
          openOn: record.openOn?.toString?.().slice(0, 10) ?? record.openOn,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error("Unexpected error getting capsule", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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
      .where(
        and(eq(timeCapsules.id, capsuleId), eq(timeCapsules.clerkId, userId))
      )
      .limit(1);

    if (!capsule) {
      return NextResponse.json(
        { error: "Time capsule not found." },
        { status: 404 }
      );
    }

    const today = startOfDay(new Date());
    const openOnValue =
      typeof capsule.openOn === "string"
        ? parseISO(capsule.openOn)
        : capsule.openOn ?? new Date(0);

    if (isBefore(today, startOfDay(openOnValue))) {
      return NextResponse.json(
        {
          error: "This time capsule is still locked.",
          openOn: capsule.openOn,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        capsule: {
          id: capsule.id,
          title: capsule.title,
          message: capsule.message,
          openOn: capsule.openOn,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error getting capsule", err);
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
    const capsuleId = searchParams.get("id");

    if (!capsuleId) {
      return NextResponse.json(
        { error: "Missing time capsule id." },
        { status: 400 }
      );
    }
    await db
      .delete(timeCapsules)
      .where(
        and(eq(timeCapsules.id, capsuleId), eq(timeCapsules.clerkId, userId))
      );

    return NextResponse.json({ ok: true }, { status: 204 });
  } catch (err) {
    console.error("Unexpected error deleting capsule", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
