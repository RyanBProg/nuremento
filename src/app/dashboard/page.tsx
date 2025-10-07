import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserForClerkAccount } from "@/db/users";
import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";

const highlightedMemories = [
  {
    title: "A sunset hike with Maya",
    description:
      "The sky burned in shades of coral and violet as we reached the ridge. Maya laughed when the wind caught her scarf, and I realized how grounded I felt in that moment.",
    timestamp: "Captured 3 days ago",
    mood: "Mood: Awe + Gratitude",
    location: "England",
  },
  {
    title: "First rehearsal with the quartet",
    description:
      "We stumbled through the opening movement, but by the third run it clicked. The room felt electric—this is the creative stretch I have been craving.",
    timestamp: "Captured 1 week ago",
    mood: "Mood: Energized",
    location: "England",
  },
  {
    title: "Calling dad on the drive home",
    description:
      "He told the story about my first bicycle again. I noticed new details in how he remembered it—maybe it matters more to him than I realized.",
    timestamp: "Captured 2 weeks ago",
    mood: "Mood: Reflective",
    location: "In The Car",
  },
];

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  await ensureUserForClerkAccount(user);

  const displayName =
    user.firstName || user.fullName || user.username || "there";

  return (
    <div className="app-container space-y-12 py-16 md:space-y-14 md:py-20">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back, {displayName}.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed">
          Here is a snapshot of the memories you have captured recently. Pick a
          quick action to add more context or reflect on a moment.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <CreateMemoryButton />
          <Link
            href="/dashboard/memories"
            className="rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2">
            View your memories
          </Link>
          <Link
            href="#"
            className="rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2">
            Start a reflection
          </Link>
        </div>
      </header>

      <section
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Highlighted memories">
        {highlightedMemories.map((memory) => (
          <article
            key={memory.title}
            className="flex flex-col gap-4 rounded-xl border p-6">
            <div className="flex justify-between text-xs font-medium uppercase tracking-[0.2em]">
              <span>{memory.timestamp}</span>
              <span>{memory.mood}</span>
            </div>
            <h3 className="text-lg font-semibold">{memory.title}</h3>
            <p className="text-sm leading-relaxed">{memory.description}</p>
            <span>{memory.location}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
