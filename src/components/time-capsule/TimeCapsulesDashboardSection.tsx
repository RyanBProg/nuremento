import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { timeCapsules } from "@/db/schema";
import { TimeCapsulesPanel } from "@/components/time-capsule/TimeCapsulesPanel";

type TimeCapsulesSectionProps = {
  userId: string;
};

export async function TimeCapsulesDashboardSection({
  userId,
}: TimeCapsulesSectionProps) {
  const capsules = await db
    .select()
    .from(timeCapsules)
    .where(eq(timeCapsules.clerkId, userId))
    .orderBy(asc(timeCapsules.openOn));

  const summaries = capsules.map((capsule) => {
    return {
      id: capsule.id,
      title: capsule.title,
      openOn: capsule.openOn,
    };
  });

  return <TimeCapsulesPanel capsules={summaries} />;
}
