import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { timeCapsules } from "@/db/schema";
import { TimeCapsulesPanel } from "@/components/time-capsules/TimeCapsulesPanel";

type TimeCapsulesSectionProps = {
  userId: string;
};

export async function TimeCapsulesSection({ userId }: TimeCapsulesSectionProps) {
  const capsules = await db
    .select()
    .from(timeCapsules)
    .where(eq(timeCapsules.clerkId, userId))
    .orderBy(asc(timeCapsules.openOn));

  const summaries = capsules.map((capsule) => {
    const openOnValue =
      capsule.openOn instanceof Date
        ? capsule.openOn.toISOString()
        : String(capsule.openOn);
    const openedAtValue =
      capsule.openedAt instanceof Date
        ? capsule.openedAt.toISOString()
        : capsule.openedAt
        ? String(capsule.openedAt)
        : null;
    const createdAtValue =
      capsule.createdAt instanceof Date
        ? capsule.createdAt.toISOString()
        : String(capsule.createdAt);

    return {
      id: capsule.id,
      title: capsule.title,
      openOn: openOnValue,
      openedAt: openedAtValue,
      createdAt: createdAtValue,
    };
  });

  return <TimeCapsulesPanel capsules={summaries} />;
}
