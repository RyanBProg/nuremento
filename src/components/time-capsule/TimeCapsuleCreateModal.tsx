"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";

type TimeCapsuleForm = {
  title: string;
  message: string;
  openOn: string;
};

const initialForm: TimeCapsuleForm = {
  title: "",
  message: "",
  openOn: "",
};

type TimeCapsuleCreateModalProps = {
  trigger: (props: { open: () => void }) => ReactNode;
};

function resolveMinDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TimeCapsuleCreateModal({
  trigger,
}: TimeCapsuleCreateModalProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<TimeCapsuleForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDate = resolveMinDate();

  useEffect(() => {
    if (!isOpen) {
      setFormValues(initialForm);
      setError(null);
    }
  }, [isOpen]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  function handleFieldChange<Key extends keyof TimeCapsuleForm>(
    key: Key,
    value: TimeCapsuleForm[Key]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = formValues.title.trim();
    const message = formValues.message.trim();
    const openOnRaw = formValues.openOn;

    if (!title) {
      setError("Please add a title.");
      return;
    }

    if (!message) {
      setError("Please write a message to your future self.");
      return;
    }

    if (!openOnRaw) {
      setError("Please choose when this capsule should open.");
      return;
    }

    const openOnDate = new Date(`${openOnRaw}T00:00:00`);
    if (Number.isNaN(openOnDate.getTime())) {
      setError("Please choose a valid date.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/time-capsules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          openOn: openOnRaw,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const messageText =
          typeof payload?.error === "string"
            ? payload.error
            : "We could not save this time capsule. Please try again.";
        setError(messageText);
        return;
      }

      setFormValues(initialForm);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("We could not save this time capsule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {trigger({ open: openModal })}
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="overflow-y-scroll max-h-full relative w-full max-w-xl rounded-2xl bg-white p-6">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 text-sm text-neutral-600 transition hover:text-black"
              aria-label="Close">
              ✕
            </button>

            <h2 className="text-xl font-semibold">Create a time capsule</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Leave a note for your future self and decide when it unlocks.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="space-y-2 text-sm font-medium">
                <span className="block">Title</span>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(event) =>
                    handleFieldChange("title", event.target.value)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  placeholder="Dear future me..."
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span className="block">Message</span>
                <textarea
                  rows={5}
                  value={formValues.message}
                  onChange={(event) =>
                    handleFieldChange("message", event.target.value)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  placeholder="What will you want to remember or celebrate?"
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span className="block">Opens on</span>
                <input
                  type="date"
                  min={minDate}
                  value={formValues.openOn}
                  onChange={(event) =>
                    handleFieldChange("openOn", event.target.value)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  required
                />
              </label>

              {error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="button button-filled"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save capsule"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="button button-border"
                  disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
