import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

const quickActions = [
  { label: "Log a new memory", href: "#" },
  { label: "Upload a photo", href: "#" },
  { label: "Start a reflection", href: "#" },
];

const highlightedMemories = [
  {
    title: "A sunset hike with Maya",
    description:
      "The sky burned in shades of coral and violet as we reached the ridge. Maya laughed when the wind caught her scarf, and I realized how grounded I felt in that moment.",
    timestamp: "Captured 3 days ago",
    mood: "Mood: Awe + Gratitude",
  },
  {
    title: "First rehearsal with the quartet",
    description:
      "We stumbled through the opening movement, but by the third run it clicked. The room felt electric—this is the creative stretch I have been craving.",
    timestamp: "Captured 1 week ago",
    mood: "Mood: Energized",
  },
  {
    title: "Calling dad on the drive home",
    description:
      "He told the story about my first bicycle again. I noticed new details in how he remembered it—maybe it matters more to him than I realized.",
    timestamp: "Captured 2 weeks ago",
    mood: "Mood: Reflective",
  },
];

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const displayName = user.firstName || user.fullName || user.username || "there";

  return (
    <div className="app-container space-y-12 py-16 md:space-y-14 md:py-20">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Welcome back, {displayName}.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
          Here is a snapshot of the memories you have captured recently. Pick a quick action to add more context or reflect on a moment.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary-soft/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Highlighted memories">
        {highlightedMemories.map((memory) => (
          <article
            key={memory.title}
            className="flex flex-col gap-4 rounded-xl border border-border-muted/70 bg-surface/95 p-6 shadow-soft"
          >
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
              <span>{memory.timestamp}</span>
              <span>{memory.mood}</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{memory.title}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{memory.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
