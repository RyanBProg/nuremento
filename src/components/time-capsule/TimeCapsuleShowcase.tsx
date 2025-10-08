"use client";

import { useState } from "react";
import { Timer } from "lucide-react";
import TimeCapsule from "./TimeCapsule";

const demoCapsule = {
  id: "123",
  title: "This is a test",
  openOn: "2025-10-01",
  openedAt: null,
  createdAt: "2025-10-08 15:04:01.407322+00",
};

export function TimeCapsuleShowcase() {
  const [isReady, setIsReady] = useState(false);

  return (
    <section className="border-b bg-white py-20 px-4 xs:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 rounded-xl border bg-background p-6 shadow-[5px_5px_0_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-3 text-center">
          <span className="inline-flex items-center justify-center gap-2 self-center text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600">
            <Timer size={14} />
            Time Capsule
          </span>
          <h3 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Seal a message for your future self
          </h3>
          <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">
            Craft a note, choose when it resurfaces, and let the capsule keep it
            safe until the moment arrives.
          </p>
        </div>

        <button
          onClick={() => setIsReady((value) => !value)}
          className="button-border">
          Toggle lock
        </button>

        <TimeCapsule showcase={true} isReady={isReady} capsule={demoCapsule} />

        <p className="max-w-2xl text-center text-xs text-neutral-500 sm:text-sm">
          Tap to open or close the capsule and preview the experience your
          future self will have when the message resurfaces.
        </p>
      </div>
    </section>
  );
}
