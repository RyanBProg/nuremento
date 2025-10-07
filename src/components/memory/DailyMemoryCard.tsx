"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";
import { MemoryCard } from "@/components/memory/MemoryCard";

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
      return null;
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

  const cardClasses =
    "flex w-full min-w-[16rem] max-w-xl flex-col space-y-4 rounded-xl border bg-background p-6";

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">Memory of the day</h2>
        <p className="text-sm text-neutral-600">
          A moment picked just for you to revisit today.
        </p>
      </header>

      {status === "loading" ? (
        <div className={`${cardClasses} space-y-3 animate-pulse`}>
          <div className="aspect-square rounded-lg bg-muted" />
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
        </div>
      ) : status === "error" ? (
        <div className={`${cardClasses} space-y-4`}>
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
        <MemoryCard
          title={memory.title}
          subtitle={subtitle ?? "Memory of the day"}
          description={memory.description}
          thumbnailUrl={memory.thumbnailUrl}
        />
      ) : (
        <MemoryCard
          title="Capture your first memory"
          subtitle="No memories yet"
          description="You haven't logged any memories yet. Record your first one to start building a daily reflection habit."
          actions={<CreateMemoryButton />}
        />
      )}
    </section>
  );
}
