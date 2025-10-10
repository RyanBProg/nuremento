"use client";

import { MemoryFormModal } from "@/components/memory-form/MemoryFormModal";

export function CreateMemoryButton() {
  return (
    <MemoryFormModal
      trigger={({ open }) => (
        <button
          type="button"
          onClick={open}
          className="button button-filled w-fit">
          Log a memory
        </button>
      )}
    />
  );
}
