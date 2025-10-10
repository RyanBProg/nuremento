"use client";

import { TimeCapsuleCreateModal } from "./TimeCapsuleCreateModal";
import TimeCapsule from "./TimeCapsule";
import { MoveRight } from "lucide-react";
import { formatDateOnly } from "@/lib/utils";

export type TimeCapsuleSummary = {
  id: string;
  title: string;
  openOn: string;
  message?: string;
};

type TimeCapsulesPanelProps = {
  capsules: TimeCapsuleSummary[];
};

export function TimeCapsulesPanel({ capsules }: TimeCapsulesPanelProps) {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto max-w-6xl py-20 lg:border-x">
        <div className="px-4 sm:px-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Time capsules</h2>
            <p className="text-sm text-neutral-600">
              Schedule notes to your future self and open them when the moment
              arrives.
            </p>
          </div>
          <TimeCapsuleCreateModal />
        </div>

        {capsules.length > 0 ? (
          <div>
            <ul className="mt-14 flex gap-4 overflow-scroll px-4 sm:px-8 pb-5">
              {capsules.map((capsule) => (
                <li
                  key={capsule.id}
                  className="max-w-min flex flex-col justify-between gap-3">
                  <TimeCapsule capsule={capsule} />
                  <div className="mt-5 space-y-2">
                    <h4 className="text-lg font-semibold max-w-[250px] md:max-w-[350px] truncate">
                      {capsule.title}
                    </h4>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                      {formatDateOnly(capsule.openOn)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {capsules.length > 2 && (
              <div className="px-4 sm:px-8 mt-5 flex gap-4 text-neutral-500 items-center">
                <span>Scroll to see more</span>
                <MoveRight size={20} />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 mx-4 sm:mx-8 rounded-lg border border-dashed p-10 text-center text-sm text-neutral-600">
            No time capsules yet. Create one to surprise your future self.
          </div>
        )}
      </div>
    </section>
  );
}
