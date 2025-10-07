"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";

type DailyMemory = {
  id: string;
  title: string;
  description: string | null;
  mood: string | null;
  location: string | null;
  occurredOn: string | null;
  occurredOnDisplay: string;
  thumbnailUrl: string | null;
} | null;

type DailyMemoryResponse = {
  memory: DailyMemory;
  error?: string;
};

export function DailyMemoryCard() {
  const [memory, setMemory] = useState<DailyMemory>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  const fetchDailyMemory = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/memories/daily", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load the memory of the day.");
      }

      const payload = (await response.json()) as DailyMemoryResponse;
      setMemory(payload.memory ?? null);
      setStatus("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fetch daily memory."
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchDailyMemory();
  }, [fetchDailyMemory]);

  const subtitle = useMemo(() => {
    if (!memory) {
      return "No memories yet";
    }

    const parts: string[] = [];

    if (memory.occurredOnDisplay && memory.occurredOnDisplay !== "—") {
      parts.push(memory.occurredOnDisplay);
    }

    if (memory.location) {
      parts.push(memory.location);
    }

    if (memory.mood) {
      parts.push(memory.mood);
    }

    return parts.join(" • ") || "Memory of the day";
  }, [memory]);

  return (
    <article className="flex h-full flex-col rounded-xl border bg-background p-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">Memory of the day</h2>
        <p className="text-sm text-muted-foreground">
          A moment picked just for you to revisit today.
        </p>
      </header>

      <div className="mt-6 flex-1">
        {status === "loading" ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-48 rounded-lg bg-neutral-300" />
            <div className="h-10 rounded bg-neutral-300" />
            <div className="h-10 w-5/6 rounded bg-neutral-300" />
          </div>
        ) : status === "error" ? (
          <div className="space-y-4">
            <p className="text-sm text-destructive">
              {error ?? "Something went wrong while loading your memory."}
            </p>
            <button
              type="button"
              onClick={fetchDailyMemory}
              className="button-border inline-flex items-center justify-center">
              Try again
            </button>
          </div>
        ) : memory ? (
          <article className="space-y-4">
            {memory.thumbnailUrl ? (
              <div className="relative overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={memory.thumbnailUrl}
                  alt={`Thumbnail for ${memory.title}`}
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {subtitle}
              </p>
              <h3 className="text-xl font-semibold">{memory.title}</h3>
              {memory.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {memory.description}
                </p>
              ) : null}
            </div>
          </article>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t logged any memories yet. Record your first one to
              start building a daily reflection habit.
            </p>
            <CreateMemoryButton />
          </div>
        )}
      </div>
    </article>
  );
}
