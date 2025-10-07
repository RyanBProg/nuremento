"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { CreateMemoryButton } from "@/components/memory-form/CreateMemoryButton";
import { MemoryCard } from "@/components/memory/MemoryCard";

type RecentMemory = {
  id: string;
  title: string;
  description: string | null;
  mood: string | null;
  location: string | null;
  occurredOn: string | null;
  occurredOnDisplay: string;
  thumbnailUrl: string | null;
};

type RecentMemoriesResponse = {
  memories: RecentMemory[];
  error?: string;
};

function buildSubtitle(memory: RecentMemory) {
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

  return parts.join(" • ") || "Recent memory";
}

export function RecentMemoriesSection() {
  const [memories, setMemories] = useState<RecentMemory[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  const fetchRecentMemories = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/memories/recent?limit=3", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load recent memories.");
      }

      const payload = (await response.json()) as RecentMemoriesResponse;
      setMemories(payload.memories ?? []);
      setStatus("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fetch recent memories."
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchRecentMemories();
  }, [fetchRecentMemories]);

  const hasMemories = useMemo(() => memories.length > 0, [memories]);
  const cardClasses =
    "flex w-full min-w-[16rem] max-w-xl flex-col space-y-3 rounded-xl border bg-background p-6";

  return (
    <section className="bg-white">
      <div className="py-20 lg:py-44 px-0 lg:px-8 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg md:text-2xl font-semibold">
              Recent memories
            </h2>
            <p className="text-sm text-neutral-600">
              Catch up on the latest moments you&apos;ve captured.
            </p>
          </div>
          <Link href="/dashboard/memories" className="button-border self-start">
            View all memories
          </Link>
        </div>
        {status === "loading" ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`${cardClasses} animate-pulse`}>
                <div className="aspect-square rounded-lg bg-muted" />
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 w-4/6 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : status === "error" ? (
          <div className={`${cardClasses} space-y-4`}>
            <p className="text-sm text-destructive">
              {error ?? "Something went wrong while loading your memories."}
            </p>
            <button
              type="button"
              onClick={fetchRecentMemories}
              className="button-border inline-flex items-center justify-center">
              Try again
            </button>
          </div>
        ) : hasMemories ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                title={memory.title}
                subtitle={buildSubtitle(memory)}
                description={memory.description}
                thumbnailUrl={memory.thumbnailUrl}
              />
            ))}
          </div>
        ) : (
          <MemoryCard
            title="No recent memories yet"
            description="Once you start logging memories, your most recent entries will show up here for easy access."
            actions={<CreateMemoryButton />}
          />
        )}
      </div>
    </section>
  );
}
