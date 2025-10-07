"use client";

import { MemoryFormModal } from "@/components/memory-form/MemoryFormModal";

export function CreateMemoryButton() {
  return (
    <MemoryFormModal
      trigger={({ open }) => (
        <button
          type="button"
          onClick={open}
          className="rounded-full bg-black border px-4 py-2 text-sm font-medium text-white transition hover:cursor-pointer hover:bg-black/80">
          + Log a memory
        </button>
      )}
    />
  );
}
