import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { TimeCapsuleShowcase } from "@/components/time-capsule/TimeCapsuleShowcase";

export default async function Home() {
  const { userId } = await auth();

  const primaryCta = userId
    ? { href: "/dashboard", label: "Open your dashboard" }
    : { href: "/sign-up", label: "Start capturing memories" };

  const secondaryCta = userId
    ? { href: "/dashboard/memories", label: "View your memories" }
    : { href: "/sign-in", label: "I already have an account" };

  return (
    <div>
      <section className="border-b overflow-clip">
        <div className="pt-10 pb-32 md:pt-32 md:pb-52 mx-auto max-w-6xl">
          <div className="relative px-4 xs:px-8 mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <Image
              className="mx-auto size-[260px] md:size-[400px] md:absolute md:bottom-22 md:translate-y-full md:-right-20 lg:-right-44 -z-10"
              src="/images/memory-card.png"
              alt="memory card"
              height={400}
              width={400}
            />
            <span className="inline-flex items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
              Your companion for meaningful recall
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Hold onto and re-live memories in unquie ways.
            </h1>
            <p className="text-base leading-relaxed sm:text-lg">
              Nuremento gives you a place to chronicle your memories, and
              revisit them through mindful, unique experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link className="button button-border" href={primaryCta.href}>
                {primaryCta.label}
              </Link>
              <Link className="button button-filled" href={secondaryCta.href}>
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TimeCapsuleShowcase />

      <section className="border-b pt-12 pb-64 lg:py-20 overflow-clip">
        <div className="mx-auto max-w-6xl relative px-4 xs:px-8">
          <div>
            <h2 className="text-center lg:text-right font-bold text-3xl">
              Get a little help from AI
            </h2>
            <p className="text-neutral-700 text-center lg:text-right">
              Bringing your memories to life with AI to invigorate your
              experiences
            </p>
          </div>
          <Image
            className="absolute top-32 xs:top-24 left-1/2 -translate-x-1/2 lg:translate-0 lg:-top-32 lg:left-0"
            src="/images/memory-ai-card.png"
            alt="memory card"
            height={400}
            width={400}
          />
        </div>
      </section>

      <section className="relative border-b">
        <img src="/images/memory-lake-banner.png" alt="" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center">
          <div className="card h-fit w-fit max-w-lg flex flex-col p-8">
            <h3 className="font-semibold text-xl">Memory Lake</h3>
            <p className="mb-5 italic ">Cast your memories into the waves</p>
            <p className="mb-10">
              Each day you return, the lake sends one back - a message from your
              past, floating gently to shore.
            </p>
            <div className="flex-1 flex items-end">
              <Link
                className="button button-border"
                href="dashboard/memory-lake">
                Visit memory lake
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="purpose" className="bg-white py-20 lg:py-44">
        <div className="py-10 px-4 xs:px-8 border-y font-bold text-3xl">
          <h2 className="text-center">Pure memories, free from distraction</h2>
        </div>
        <div className="border-b">
          <div className="px-0 md:px-8 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 lg:p-14 flex items-center">
              <ul className="grid gap-4">
                <li>
                  <span className="font-semibold">
                    Build a personal archive of memories and experiences
                  </span>{" "}
                  - capture life’s moments without the noise of social media.
                </li>
                <li>
                  <span className="font-semibold">
                    Interact with your memories in unique ways
                  </span>{" "}
                  - drop them in the ocean, seal them in a capsule, or set them
                  free.
                </li>
                <li>
                  <span className="font-semibold">
                    Get a little help from AI
                  </span>{" "}
                  - bring stories to life, regardless of your writing skills,
                  with our AI descrpition writing feature.
                </li>
              </ul>
            </div>
            <div className="p-10 lg:p-14 border-t md:border-l md:border-t-0">
              <h3 className="font-bold mb-3 text-lg">The Purpose</h3>
              <p>
                Our lives move fast, and our memories often get lost in the
                noise. <span className="font-semibold">Nuremento</span> exists
                to bring them back — simply, quietly, and meaningfully. We
                provide space to capture your core memories — free from
                comparison, clutter, or constant scrolling, leaving space for
                internal reflection. Here, you can revisit the moments that
                shaped you, send reminders of hope to your future self, and let
                go of the ones that still ache.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
