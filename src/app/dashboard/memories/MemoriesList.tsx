"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { MemoryCard } from "@/components/memory/MemoryCard";
import {
  MemoryFormModal,
  type MemoryFormData,
} from "@/components/memory-form/MemoryFormModal";

type MemoryRecord = {
  thumbnailUrl: string | null;
  occurredOnDisplay: string | Date;
  id: string;
  clerkId: string;
  title: string;
  description: string | null;
  occurredOn: string | null;
  location: string | null;
  mood: string | null;
  imageKey: string | null;
  imageThumbnailKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type MemoriesListProps = {
  initialMemories: MemoryRecord[];
};

function resolveDisplayDate(value: string | Date) {
  if (value instanceof Date) {
    return value.toLocaleDateString("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (!value) {
    return "—";
  }

  return value;
}

export function MemoriesList({ initialMemories }: MemoriesListProps) {
  const router = useRouter();
  const [memories, setMemories] = useState(initialMemories);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    setMemories(initialMemories);
  }, [initialMemories]);

  async function handleDelete(memory: MemoryRecord) {
    const confirmed = window.confirm(
      `Delete “${memory.title}”? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(memory.id);
    setGlobalError(null);

    try {
      const response = await fetch(`/api/memories?id=${memory.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "We could not delete this memory. Please try again.";
        setGlobalError(message);
        return;
      }

      setMemories((items) => items.filter((item) => item.id !== memory.id));
      router.refresh();
    } catch (error) {
      console.error(error);
      setGlobalError("We could not delete this memory. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const mappedMemories = useMemo(
    () =>
      memories.map((memory) => ({
        record: memory,
        formData: {
          id: memory.id,
          title: memory.title,
          description: memory.description,
          occurredOn: memory.occurredOn,
          location: memory.location,
          mood: memory.mood,
          thumbnailUrl: memory.thumbnailUrl,
        } satisfies MemoryFormData,
      })),
    [memories]
  );

  return (
    <div className="space-y-6">
      {globalError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {globalError}
        </div>
      ) : null}

      {mappedMemories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-neutral-600">
          You haven’t created any memories yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mappedMemories.map(({ record: memory, formData }) => {
            const isDeleting = deletingId === memory.id;

            const subtitleParts: string[] = [];
            const displayDate = resolveDisplayDate(memory.occurredOnDisplay);

            if (displayDate) {
              subtitleParts.push(displayDate);
            }
            if (memory.location) {
              subtitleParts.push(memory.location);
            }
            if (memory.mood) {
              subtitleParts.push(`Mood: ${memory.mood}`);
            }

            return (
              <MemoryCard
                key={memory.id}
                title={memory.title}
                subtitle={subtitleParts.join(" • ")}
                description={memory.description}
                thumbnailUrl={memory.thumbnailUrl}
                thumbnailFallback={
                  <div className="flex h-full w-full items-center justify-center rounded-lg border bg-muted text-sm text-neutral-600">
                    No photo added
                  </div>
                }
                actions={
                  <div className="mt-auto flex w-full gap-2">
                    <MemoryFormModal
                      memory={formData}
                      trigger={({ open }) => (
                        <button
                          type="button"
                          onClick={open}
                          className="flex-1 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-muted hover:cursor-pointer">
                          Edit
                        </button>
                      )}
                    />
                    <button
                      type="button"
                      className="flex-1 rounded-full border border-destructive px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                      onClick={() => handleDelete(memory)}
                      disabled={isDeleting}>
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
