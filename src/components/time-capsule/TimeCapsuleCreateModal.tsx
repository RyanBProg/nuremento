"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

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

function resolveMinDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TimeCapsuleCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<TimeCapsuleForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const minDate = resolveMinDate();

  function handleFieldChange<Key extends keyof TimeCapsuleForm>(
    key: Key,
    value: TimeCapsuleForm[Key]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsOpen(false);

    if (isOpen) {
      dialogRef.current?.showModal();
      document.addEventListener("keydown", onKeyDown);
    } else {
      setFormValues(initialForm);
      setError(null);
      dialogRef.current?.close();
    }

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

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
        const payload = await response.json();
        const messageText =
          typeof payload?.error === "string"
            ? payload.error
            : payload.error.fieldErrors.message
            ? payload.error.fieldErrors.message
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
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="button button-filled">
        Create capsule
      </button>
      {isOpen ? (
        <dialog
          ref={dialogRef}
          onClick={(e) => {
            const dialog = dialogRef.current;
            if (dialog && e.target === dialog) {
              setIsOpen(false);
            }
          }}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          className="m-auto overflow-y-scroll max-h-full w-full max-w-xl rounded-2xl bg-white p-6 backdrop:bg-black/50">
          <h2 className="text-xl font-semibold" id="dialog-title">
            Create a time capsule
          </h2>
          <p className="mt-1 text-sm text-neutral-600" id="dialog-description">
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

            {error ? <div className="text-sm text-red-500">{error}</div> : null}

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="button button-filled"
                disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save capsule"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="button button-border"
                disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </form>
        </dialog>
      ) : null}
    </>
  );
}
