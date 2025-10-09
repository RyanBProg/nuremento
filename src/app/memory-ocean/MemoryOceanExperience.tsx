"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./MemoryOcean.module.css";

type OceanMemory = {
  id: string;
  text: string;
  createdAt: string;
};

type BottleState = "idle" | "ready" | "dragging" | "throwing";

const createMemory = (text: string): OceanMemory => ({
  id: `memory-${
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)
  }`,
  text,
  createdAt: new Date().toISOString(),
});

const randomFrom = <T,>(items: T[]): T | null => {
  if (!items.length) {
    return null;
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function MemoryOceanExperience() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const oceanRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  const seeds = useMemo<OceanMemory[]>(
    () => [
      createMemory(
        "Today I promised to write more letters. The tide felt warm on my feet as I said it out loud."
      ),
      createMemory(
        "Grandma's stories about the moon guiding sailors still make me feel safe. I hope I remember them forever."
      ),
      createMemory(
        "I laughed until I cried over pancakes this morning. May future-me taste that joy again."
      ),
    ],
    []
  );

  const [oceanMemories, setOceanMemories] = useState<OceanMemory[]>(seeds);
  const [dailyBottle, setDailyBottle] = useState<OceanMemory | null>(() =>
    randomFrom(seeds)
  );

  const [messageDraft, setMessageDraft] = useState("");
  const [activeBottleMessage, setActiveBottleMessage] = useState<string | null>(
    null
  );
  const [bottleState, setBottleState] = useState<BottleState>("idle");
  const [bottlePosition, setBottlePosition] = useState({ x: 0, y: 0 });
  const [bottleSize, setBottleSize] = useState({ width: 140, height: 140 });
  const [dailyOpen, setDailyOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const initializeBottlePosition = useCallback(() => {
    const sceneRect = sceneRef.current?.getBoundingClientRect();

    if (!sceneRect) {
      return;
    }

    const defaultX = sceneRect.width * 0.15;
    const defaultY = sceneRect.height * 0.55;
    setBottlePosition({ x: defaultX, y: defaultY });
  }, []);

  useEffect(() => {
    initializeBottlePosition();
  }, [initializeBottlePosition]);

  const handlePrepareBottle = () => {
    const trimmed = messageDraft.trim();

    if (!trimmed) {
      setStatusMessage("Write a memory before sealing the bottle.");
      return;
    }

    setStatusMessage(
      "Hold and drag the bottle towards the ocean, then release to set it adrift."
    );
    setActiveBottleMessage(trimmed);
    setBottleState("ready");
    initializeBottlePosition();
  };

  useEffect(() => {
    const handleResize = () => {
      if (bottleState === "idle") {
        initializeBottlePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bottleState, initializeBottlePosition]);

  useEffect(() => {
    if (bottleState !== "dragging") {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      const sceneRect = sceneRef.current?.getBoundingClientRect();

      if (!sceneRect) {
        return;
      }

      const nextX = event.clientX - sceneRect.left - bottleSize.width / 2;
      const nextY = event.clientY - sceneRect.top - bottleSize.height / 2;

      setBottlePosition({
        x: clamp(nextX, -20, sceneRect.width - bottleSize.width + 20),
        y: clamp(nextY, -20, sceneRect.height - bottleSize.height + 20),
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      pointerIdRef.current = null;

      const oceanRect = oceanRef.current?.getBoundingClientRect();

      const inOcean =
        oceanRect &&
        event.clientX >= oceanRect.left &&
        event.clientX <= oceanRect.right &&
        event.clientY >= oceanRect.top &&
        event.clientY <= oceanRect.bottom;

      if (inOcean) {
        handleBottleRelease();
      } else {
        setBottleState("ready");
        initializeBottlePosition();
        setStatusMessage("Aim for the shimmering waves to send it away.");
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    bottleState,
    bottleSize.height,
    bottleSize.width,
    initializeBottlePosition,
  ]);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (
    event
  ) => {
    if (bottleState !== "ready") {
      return;
    }

    if (!bottleRef.current) {
      return;
    }

    const rect = bottleRef.current.getBoundingClientRect();
    setBottleSize({ width: rect.width, height: rect.height });
    pointerIdRef.current = event.pointerId;
    setBottleState("dragging");
    setStatusMessage("When you reach the tide line, let go.");
  };

  const handleBottleRelease = () => {
    if (!activeBottleMessage) {
      setBottleState("idle");
      return;
    }

    setBottleState("throwing");
    setStatusMessage("Your message slips beneath the waves...");

    setTimeout(() => {
      setBottleState("idle");
      setActiveBottleMessage(null);
      setMessageDraft("");
      setStatusMessage(null);
    }, 900);

    setOceanMemories((previous) => {
      const nextMemories = previous.concat(createMemory(activeBottleMessage));
      const nextDaily = randomFrom(nextMemories);
      setDailyBottle(nextDaily);
      return nextMemories;
    });
  };

  const isBottleVisible =
    bottleState === "ready" ||
    bottleState === "dragging" ||
    bottleState === "throwing";

  const hintLabel =
    bottleState === "idle"
      ? "Write your memory below, then press “Seal bottle”."
      : bottleState === "dragging"
      ? "Guide the bottle beyond the shoreline."
      : bottleState === "throwing"
      ? "Sending it to deeper waters..."
      : "Drag and release toward the ocean.";

  return (
    <div className="flex w-full flex-col">
      <section
        ref={sceneRef}
        className={styles.scene}
        aria-label="Coastal vignette">
        <div className={styles.sky} />
        <div className={styles.sun} aria-hidden="true" />
        <div
          className={`${styles.cloud} ${styles.cloudOne}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.cloud} ${styles.cloudTwo}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.cloud} ${styles.cloudThree}`}
          aria-hidden="true"
        />

        <div ref={oceanRef} className={styles.ocean} aria-hidden="true">
          <div className={`${styles.wave} ${styles.waveBack}`} />
          <div className={`${styles.wave} ${styles.waveMid}`} />
          <div className={`${styles.wave} ${styles.waveFront}`} />
        </div>

        <div className={styles.ship} aria-hidden="true">
          <img src="/images/ship.png" alt="" />
          {/* <svg
            viewBox="0 0 160 90"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <defs>
              <linearGradient
                id="hullGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1f2937" />
              </linearGradient>
              <linearGradient id="sailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f9fafb" />
                <stop offset="100%" stopColor="#cbd5f5" />
              </linearGradient>
            </defs>
            <polygon
              points="15,70 145,70 120,85 40,85"
              fill="url(#hullGradient)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <rect x="73" y="20" width="5" height="50" fill="#0f172a" />
            <polygon
              points="78,22 120,60 78,60"
              fill="url(#sailGradient)"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <polygon
              points="78,22 35,55 78,55"
              fill="#f8fafc"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <circle cx="60" cy="72" r="3" fill="#fff" opacity="0.6" />
            <circle cx="85" cy="72" r="3" fill="#fff" opacity="0.6" />
            <circle cx="110" cy="72" r="3" fill="#fff" opacity="0.6" />
          </svg> */}
        </div>

        <div className={styles.beach} aria-hidden="true" />

        {isBottleVisible && (
          <div
            ref={bottleRef}
            role="presentation"
            className={`${styles.messageBottle} ${
              bottleState === "dragging" ? styles.bottleDragging : ""
            } ${bottleState === "throwing" ? styles.bottleSink : ""}`}
            style={{
              transform: `translate3d(${bottlePosition.x}px, ${bottlePosition.y}px, 0)`,
            }}
            onPointerDown={handlePointerDown}>
            <div className={styles.bottleGlass}>
              <div className={styles.bottleHighlight} />
              <div className={styles.bottleShadow} />
            </div>
            <div className={styles.bottleCork} />
            <div className={styles.bottleScroll} />
          </div>
        )}

        {dailyBottle && bottleState !== "dragging" && (
          <button
            type="button"
            className={`${styles.washedBottle} ${
              dailyOpen ? styles.washedBottleActive : ""
            }`}
            onClick={() => setDailyOpen(true)}
            aria-label="Open the washed-up bottle">
            <div className={styles.bottleGlass}>
              <div className={styles.bottleHighlight} />
              <div className={styles.bottleShadow} />
            </div>
            <div className={styles.bottleCork} />
            <div className={styles.bottleScroll} />
          </button>
        )}
      </section>

      <section className="relative isolate mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-600">
            Memory Ocean
          </p>
          <h1 className="text-balance text-3xl font-semibold sm:text-4xl md:text-5xl">
            Cast your moments adrift and let today&apos;s tide bring one back.
          </h1>
          <p className="text-pretty text-base text-slate-700 sm:text-lg">
            Write something worth remembering, place it in the bottle, and throw
            it into the Memory Ocean. One message will return each day, washed
            gently onto the shore for you to revisit.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <form
            className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_25px_45px_-20px_rgba(15,23,42,0.35)] backdrop-blur"
            onSubmit={(event) => {
              event.preventDefault();
              handlePrepareBottle();
            }}>
            <label htmlFor="memory" className="font-medium text-slate-900">
              Your memory
            </label>
            <textarea
              id="memory"
              name="memory"
              rows={5}
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              placeholder="Write a memory, message, or intention you want future-you to rediscover."
              className="min-h-[160px] resize-none rounded-2xl border border-slate-300 bg-white/90 p-4 text-base leading-relaxed shadow-inner outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <p className="text-sm text-slate-600">{hintLabel}</p>
            <p
              className="min-h-[1.5rem] text-sm font-medium text-slate-900"
              aria-live="polite">
              {statusMessage}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="button-filled"
                disabled={
                  bottleState === "dragging" || bottleState === "throwing"
                }>
                Seal bottle
              </button>
              {bottleState === "ready" && (
                <span className="text-sm text-slate-600">
                  Bottle ready. Drag it towards the glowing waves.
                </span>
              )}
            </div>
          </form>

          <aside className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-sky-50/70 p-6 text-slate-800 shadow-[0_25px_45px_-24px_rgba(14,116,144,0.45)] backdrop-blur">
            <h2 className="text-xl font-semibold">
              Today&apos;s returning message
            </h2>
            <p className="text-sm text-slate-600">
              Find the bottle on the shoreline and open it to read the words the
              tide chose for you today.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-slate-700">
              <li>• Bottles set adrift reappear here after time.</li>
              <li>• Only one returns per day, brought in on the tide.</li>
              <li>• Click the washed-up bottle to reveal its note.</li>
            </ul>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm leading-relaxed shadow-inner">
              {dailyBottle ? (
                <>
                  <p className="font-medium text-slate-800">
                    Most recent tide clues:
                  </p>
                  <p className="mt-2 max-h-24 overflow-hidden text-ellipsis text-slate-600">
                    “{dailyBottle.text}”
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                    Tap the bottle by the waves to read it fully.
                  </p>
                </>
              ) : (
                <p className="text-slate-600">
                  Toss a few bottles into the Memory Ocean and one will float
                  back for you tomorrow.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      {dailyBottle && dailyOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Washed up memory">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDailyOpen(false)}
            aria-label="Close memory overlay"
          />
          <div className="relative z-10 max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Tide-carried memory
            </h3>
            <p className="mt-3 whitespace-pre-line text-pretty text-slate-700">
              {dailyBottle.text}
            </p>
            <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">
              Returned{" "}
              {new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              }).format(new Date(dailyBottle.createdAt))}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="button-border"
                onClick={() => setDailyOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
