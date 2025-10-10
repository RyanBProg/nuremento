import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { TimeCapsuleShowcase } from "@/components/time-capsule/TimeCapsuleShowcase";

export default async function Home() {
  const { userId } = await auth();

  const primaryCta = userId
    ? { href: "/dashboard/memories", label: "View your memories" }
    : { href: "/sign-up", label: "Start capturing memories" };

  return (
    <div>
      <section className="h-[calc(100vh-70px)] border-b overflow-clip flex justify-center items-center">
        <div className="py-10 px-4 xs:px-8 max-w-3xl">
          <div className="flex flex-col items-center gap-10">
            <Image
              className="mx-auto size-[260px] md:size-[350px] -z-10"
              src="/images/memory-card.png"
              alt="memory card"
              height={350}
              width={350}
            />
            <div className="flex flex-col items-center text-center gap-6">
              <span className="border-y border-primary-light py-1 px-2 text-primary-dark inline-flex items-center justify-center text-xs font-semibold uppercase tracking-[0.2em]">
                Your companion for meaningful recall
              </span>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Hold onto and re-live memories in unquie ways.
              </h1>
              <p className="text-base text-neutral-600 leading-relaxed sm:text-lg">
                Nuremento gives you a place to chronicle your memories, and
                revisit them through mindful, unique experiences.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  className="button button-border border-primary text-primary-dark hover:shadow-[2px_2px_0_rgba(58,109,218,1)]"
                  href={primaryCta.href}>
                  {primaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b h-[calc(100vh-70px)] sm:h-[500px] overflow-clip">
        <Image
          src="/images/memory-lake-banner.png"
          alt="memory lake"
          fill
          quality={100}
          className="object-cover mx-auto min-h-full min-w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/70 flex items-center justify-center px-4 xs:px-8">
          <article className="card h-fit w-fit max-w-lg flex flex-col p-8">
            <h2 className="font-semibold text-xl">Memory Lake</h2>
            <p className="mb-4 italic text-neutral-600">
              Cast your memories into the waves
            </p>
            <p className="mb-8">
              Each day you return, the lake sends one back - a message from your
              past, floating gently to shore.
            </p>
            <div className="flex-1 flex items-end">
              <Link className="button button-border" href="/memory-lake">
                Visit memory lake
              </Link>
            </div>
          </article>
        </div>
      </section>

      <TimeCapsuleShowcase />

      <section className="bg-gradient-to-t from-background via-white border-b pt-12 pb-64 lg:py-20 overflow-clip">
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

      <section id="purpose" className="bg-white py-20 lg:py-44">
        <div className="py-10 px-4 xs:px-8 border-y font-bold text-3xl">
          <h2 className="text-center">Pure memories, free from distraction</h2>
        </div>
        <div className="border-b">
          <div className="px-0 md:px-8 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2">
            <article className="p-10 lg:p-14 flex items-center">
              <ul className="grid gap-4">
                <li>
                  <strong className="font-semibold">
                    Build a personal archive of memories and experiences
                  </strong>{" "}
                  - capture life&apos;s moments without the noise of social
                  media.
                </li>
                <li>
                  <strong className="font-semibold">
                    Interact with your memories in unique ways
                  </strong>{" "}
                  - drop them in the lake, seal them in a capsule, or set them
                  free.
                </li>
                <li>
                  <strong className="font-semibold">
                    Get a little help from AI
                  </strong>{" "}
                  - bring stories to life, regardless of your writing skills,
                  with our AI descrpition writing feature.
                </li>
              </ul>
            </article>
            <article className="p-10 lg:p-14 border-t md:border-l md:border-t-0">
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
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
