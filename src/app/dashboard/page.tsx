import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";
import { DailyMemoryCard } from "@/components/memories/DailyMemoryCard";
import { TimeCapsulesDashboardSection } from "@/components/time-capsule/TimeCapsulesDashboardSection";
import { RecentMemoriesSection } from "@/components/memories/RecentMemoriesSection";
// import { ensureUserForClerkAccount } from "@/db/users";

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  // await ensureUserForClerkAccount(user);

  const displayName =
    user.firstName || user.fullName || user.username || "there";

  return (
    <div>
      <section>
        <div className="border-b">
          <div className="px-0 lg:px-8 mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {displayName}.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed">
                Here is a snapshot of the memories you have captured recently.
                Pick a quick action to add more context or reflect on a moment.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <CreateMemoryButton />
                <Link href="/dashboard/memories" className="button-border">
                  View your memories
                </Link>
              </div>
            </div>
            <div className="p-10 lg:p-14 border-t lg:border-l lg:border-t-0 flex justify-center">
              <DailyMemoryCard userId={user.id} />
            </div>
          </div>
        </div>
      </section>

      <TimeCapsulesDashboardSection userId={user.id} />

      <RecentMemoriesSection userId={user.id} />
    </div>
  );
}
