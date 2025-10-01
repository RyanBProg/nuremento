import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const features = [
  {
    title: "Rich memory journal",
    description:
      "Layer every entry with context—locations, people, sensory details, and media attachments—so revisiting a moment feels effortless.",
  },
  {
    title: "Smart resurfacing",
    description:
      "Gentle reminders resurface meaningful memories on anniversaries, milestones, or when similar themes appear in your life.",
  },
  {
    title: "Conversational recall",
    description:
      "Ask natural questions like ‘When was the last time I felt this confident?’ and get grounded, personal answers instantly.",
  },
];

const timeline = [
  {
    label: "Capture",
    detail:
      "Record a moment in seconds with voice, text, or photo uploads—Nuremento fills in the details for you.",
  },
  {
    label: "Enrich",
    detail:
      "Add prompts, reflections, and connected memories to build a living archive of who you are becoming.",
  },
  {
    label: "Reflect",
    detail:
      "Return to curated memory playlists whenever you need grounding, encouragement, or perspective.",
  },
];

export default async function Home() {
  const { userId } = await auth();

  const primaryCta = userId
    ? { href: "/dashboard", label: "Open your dashboard" }
    : { href: "/sign-up", label: "Start capturing memories" };

  const secondaryCta = userId
    ? { href: "/dashboard", label: "Review recent entries" }
    : { href: "/sign-in", label: "I already have an account" };

  return (
    <div className="app-container space-y-16 py-16 md:space-y-20 md:py-24">
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary-soft/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Your companion for meaningful recall
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Hold onto every detail that makes your story unique.
        </h1>
        <p className="text-base leading-relaxed text-text-secondary sm:text-lg">
          Nuremento gives you a calm place to chronicle your memories, add depth
          with guided prompts, and then revisit them through mindful,
          conversational experiences.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            className="rounded-full bg-gradient-to-r from-primary-soft to-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:from-primary hover:to-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            href={primaryCta.href}>
            {primaryCta.label}
          </Link>
          <Link
            className="rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary-soft/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            href={secondaryCta.href}>
            {secondaryCta.label}
          </Link>
        </div>
      </section>

      <section id="features" className="space-y-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            A memory OS crafted for emotional fidelity.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            Build a trusted archive that preserves context, sentiment, and
            personal growth—without the overwhelm of traditional journaling.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-3 rounded-xl border border-border-muted/70 bg-surface/95 p-8 shadow-soft">
              <h3 className="text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="space-y-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Designed for reflection in three simple rhythms.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            Let Nuremento capture the details while you stay present—then return
            any time to explore the stories that shape you.
          </p>
        </div>
        <div className="grid gap-6 rounded-xl border border-border-muted/70 bg-surface/95 p-8 shadow-soft md:grid-cols-3">
          {timeline.map((item) => (
            <div key={item.label} className="flex flex-col gap-2 text-left">
              <strong className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                {item.label}
              </strong>
              <span className="text-base font-medium text-text-primary">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="security" className="space-y-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Private by default, secure by design.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            End-to-end safeguards keep your memories protected. Granular
            controls put you in charge of what is shared and when—and Clerk
            handles sign-in, session management, and multi-factor flows out of
            the box.
          </p>
        </div>
      </section>
    </div>
  );
}
