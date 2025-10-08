"use client";

import { useState } from "react";
import { Timer } from "lucide-react";
import TimeCapsule from "./TimeCapsule";

const demoCapsuleBase = {
  id: "demo-capsule",
  title: "Letter from calm you",
  openOn: "2025-10-01",
  openedAt: null,
  createdAt: new Date().toISOString(),
  message:
    "Hey, future me.\n\nIf you're reading this, you made it through another season. Remember the way the air smelt after the rain today and how quiet things felt once you let go of the pressure to be everywhere at once. You're doing enough. Rest is progress too.\n\nTake one slow breath for the version of you who wrote this and keep going gently.",
};

export function TimeCapsuleShowcase() {
  const [isReady, setIsReady] = useState(false);

  return (
    <section className="border-b bg-white py-20 md:py-38 px-4 xs:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 rounded-xl border bg-background p-6 shadow-[5px_5px_0_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-3 text-center">
          <span className="inline-flex items-center justify-center gap-2 self-center text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600">
            <Timer size={14} />
            Time Capsule
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Seal a message for your future self
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">
            Craft a note, choose when it resurfaces, and let the capsule keep it
            safe until the moment arrives.
          </p>
        </div>
        <div className="relative">
          <span className="absolute -left-3 -translate-x-full top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.3em] text-black">
            Lock
          </span>
          <button
            onClick={() => setIsReady((value) => !value)}
            className={`border relative inline-flex h-6 sm:h-8 w-12 sm:w-16 items-center rounded-full transition-colors duration-500 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
              isReady
                ? "bg-gradient-to-r from-green-400 to-green-500"
                : "bg-gradient-to-r from-red-500 to-red-400"
            }`}>
            {/* Toggle knob */}
            <span
              className={`border inline-block h-4 sm:h-6 w-4 sm:w-6 transform rounded-full bg-white shadow-md transition-all duration-500 ${
                isReady
                  ? "translate-x-6 sm:translate-x-8 shadow-[0_0_12px_rgba(147,51,234,0.6)]"
                  : "translate-x-1"
              }`}
            />
          </button>
          <span className="absolute -right-4 translate-x-full top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.3em] text-black">
            Unlock
          </span>
        </div>

        <TimeCapsule
          capsule={{
            ...demoCapsuleBase,
            openOn: isReady
              ? new Date().toISOString().slice(0, 10)
              : demoCapsuleBase.openOn,
          }}
          isReadyOverride={isReady}
        />

        <p className="max-w-2xl text-center text-xs text-neutral-500 sm:text-sm">
          Tap to open the capsule and preview the joyful experience of unlocking
          a message.
        </p>
      </div>
    </section>
  );
}
