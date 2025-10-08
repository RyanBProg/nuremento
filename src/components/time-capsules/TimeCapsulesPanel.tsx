"use client";

import { useMemo } from "react";

import { TimeCapsuleCreateModal } from "./TimeCapsuleCreateModal";
import { TimeCapsuleOpenModal } from "./TimeCapsuleOpenModal";

type TimeCapsuleSummary = {
  id: string;
  title: string;
  openOn: string;
  openedAt: string | null;
  createdAt: string;
};

type TimeCapsulesPanelProps = {
  capsules: TimeCapsuleSummary[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function TimeCapsulesPanel({ capsules }: TimeCapsulesPanelProps) {
  const { locked, unlocked } = useMemo(() => {
    const lockedCapsules: TimeCapsuleSummary[] = [];
    const unlockedCapsules: TimeCapsuleSummary[] = [];

    const now = new Date();

    for (const capsule of capsules) {
      if (capsule.openedAt) {
        unlockedCapsules.push(capsule);
        continue;
      }

      const openDate = new Date(capsule.openOn);
      if (!Number.isNaN(openDate.getTime()) && openDate <= now) {
        unlockedCapsules.push(capsule);
      } else {
        lockedCapsules.push(capsule);
      }
    }

    return {
      locked: lockedCapsules,
      unlocked: unlockedCapsules,
    };
  }, [capsules]);

  const hasAny = capsules.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Time capsules</h2>
          <p className="text-sm text-neutral-600">
            Schedule notes to your future self and open them when the moment
            arrives.
          </p>
        </div>
        <TimeCapsuleCreateModal
          trigger={({ open }) => (
            <button
              type="button"
              onClick={open}
              className="self-start rounded-full border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-900">
              Create capsule
            </button>
          )}
        />
      </div>

      {hasAny ? (
        <div className="space-y-6">
          {unlocked.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-600">
                Ready to open
              </h3>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {unlocked.map((capsule) => (
                  <li
                    key={capsule.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border bg-background p-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                        {formatDate(capsule.openOn)}
                      </p>
                      <h4 className="text-lg font-semibold">{capsule.title}</h4>
                      <p className="text-xs text-neutral-500">
                        Created {formatDate(capsule.createdAt)}
                      </p>
                      {capsule.openedAt ? (
                        <p className="text-xs text-neutral-500">
                          Opened {formatDate(capsule.openedAt)}
                        </p>
                      ) : null}
                    </div>

                    <TimeCapsuleOpenModal
                      capsuleId={capsule.id}
                      title={capsule.title}
                      openOn={capsule.openOn}
                      openedAt={capsule.openedAt}
                      trigger={({ open }) => (
                        <button
                          type="button"
                          onClick={open}
                          className="rounded-full border border-black bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-900">
                          Open capsule
                        </button>
                      )}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {locked.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-600">
                Locked
              </h3>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {locked.map((capsule) => (
                  <li
                    key={capsule.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border bg-background p-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                        Unlocks {formatDate(capsule.openOn)}
                      </p>
                      <h4 className="text-lg font-semibold">{capsule.title}</h4>
                      <p className="text-xs text-neutral-500">
                        Created {formatDate(capsule.createdAt)}
                      </p>
                    </div>

                    <TimeCapsuleOpenModal
                      capsuleId={capsule.id}
                      title={capsule.title}
                      openOn={capsule.openOn}
                      openedAt={capsule.openedAt}
                      trigger={({ open, disabled }) => (
                        <button
                          type="button"
                          onClick={open}
                          disabled={disabled}
                          className="rounded-full border px-3 py-2 text-sm font-medium text-neutral-600 transition disabled:cursor-not-allowed disabled:opacity-60">
                          Locked
                        </button>
                      )}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-neutral-600">
          No time capsules yet. Create one to surprise your future self.
        </div>
      )}
    </section>
  );
}
