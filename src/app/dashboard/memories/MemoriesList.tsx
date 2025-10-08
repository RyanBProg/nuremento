"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";

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

type SortOrder = "asc" | "desc";

const PAGE_SIZE = 10;
const DEFAULT_SORT: SortOrder = "desc";

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

function toTimestamp(value: string | Date | null | undefined) {
  if (!value) {
    return 0;
  }

  const date = value instanceof Date ? value : new Date(value);
  const timestamp = date.getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function resolveOccurredYear(memory: MemoryRecord) {
  if (!memory.occurredOn) {
    return null;
  }

  const parsed = new Date(memory.occurredOn);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return String(parsed.getFullYear());
}

export function MemoriesList({ initialMemories }: MemoriesListProps) {
  const router = useRouter();
  const [memories, setMemories] = useState(initialMemories);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMemories(initialMemories);
  }, [initialMemories]);

  async function handleDelete(memory: MemoryRecord) {
    const confirmed = window.confirm(
      `Delete “${memory.title}”? This action cannot be undone.`,
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
    [memories],
  );

  const availableYears = useMemo(() => {
    const years = new Set<string>();

    for (const memory of memories) {
      const year = resolveOccurredYear(memory);
      if (year) {
        years.add(year);
      }
    }

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [memories]);

  const processedMemories = useMemo(() => {
    const filtered = mappedMemories.filter(({ record }) => {
      if (selectedYear === "all") {
        return true;
      }

      const year = resolveOccurredYear(record);
      return year === selectedYear;
    });

    const sorted = filtered
      .slice()
      .sort((a, b) => {
        const aValue =
          toTimestamp(a.record.occurredOn) ||
          toTimestamp(a.record.createdAt) ||
          toTimestamp(a.record.updatedAt);
        const bValue =
          toTimestamp(b.record.occurredOn) ||
          toTimestamp(b.record.createdAt) ||
          toTimestamp(b.record.updatedAt);

        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });

    return sorted;
  }, [mappedMemories, selectedYear, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(processedMemories.length / PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage((previous) =>
      previous > totalPages ? totalPages : Math.max(previous, 1),
    );
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [memories]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleMemories = processedMemories.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const startDisplay = processedMemories.length ? startIndex + 1 : 0;
  const endDisplay = startIndex + visibleMemories.length;
  const hasAnyMemories = mappedMemories.length > 0;
  const hasFilteredResults = visibleMemories.length > 0;
  const showPagination = totalPages > 1;

  function handleYearChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedYear(event.target.value);
    setSortOrder(DEFAULT_SORT);
    setCurrentPage(1);
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value === "asc" ? "asc" : "desc";
    setSortOrder(value);
    setCurrentPage(1);
  }

  function goToPreviousPage() {
    setCurrentPage((previous) => Math.max(previous - 1, 1));
  }

  function goToNextPage() {
    setCurrentPage((previous) => Math.min(previous + 1, totalPages));
  }

  return (
    <div className="space-y-6">
      {globalError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {globalError}
        </div>
      ) : null}

      {hasAnyMemories ? (
        <>
          <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                <span>Filter by year</span>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="rounded-full border px-3 py-2 text-sm text-neutral-700 transition hover:border-neutral-400"
                >
                  <option value="all">All years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                <span>Sort by</span>
                <select
                  value={sortOrder}
                  onChange={handleSortChange}
                  className="rounded-full border px-3 py-2 text-sm text-neutral-700 transition hover:border-neutral-400"
                >
                  <option value="desc">Newest to oldest</option>
                  <option value="asc">Oldest to newest</option>
                </select>
              </label>
            </div>

            <div className="text-xs text-neutral-600">
              Showing {startDisplay}–{endDisplay} of {processedMemories.length}{" "}
              memories
            </div>
          </div>

          {hasFilteredResults ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleMemories.map(({ record: memory, formData }) => {
                  const isDeleting = deletingId === memory.id;

                  const subtitleParts: string[] = [];
                  const displayDate = resolveDisplayDate(
                    memory.occurredOnDisplay,
                  );

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
                                className="flex-1 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-muted hover:cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                          />
                          <button
                            type="button"
                            className="flex-1 rounded-full border border-destructive px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            onClick={() => handleDelete(memory)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      }
                    />
                  );
                })}
              </div>

              {showPagination ? (
                <div className="flex flex-col items-center justify-between gap-3 rounded-lg border bg-white p-4 text-sm text-neutral-700 sm:flex-row">
                  <div>
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="rounded-full border px-3 py-2 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="rounded-full border px-3 py-2 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-neutral-600">
              No memories match the selected filters.
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-neutral-600">
          You haven’t created any memories yet.
        </div>
      )}
    </div>
  );
}
