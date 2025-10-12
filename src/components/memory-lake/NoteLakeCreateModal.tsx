"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

type NoteLakeForm = {
  title: string;
  message: string;
};

const initialForm: NoteLakeForm = {
  title: "",
  message: "",
};

export function NoteLakeCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<NoteLakeForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  function handleFieldChange<Key extends keyof NoteLakeForm>(
    key: Key,
    value: NoteLakeForm[Key]
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

    if (!title) {
      setError("Please add a title.");
      return;
    }

    if (!message) {
      setError("Please write a message to your future self.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/lake-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        const messageText =
          typeof payload?.error === "string"
            ? payload.error
            : payload.error.fieldErrors.message
            ? payload.error.fieldErrors.message
            : "We could not save this note. Please try again.";
        setError(messageText);
        return;
      }

      setFormValues(initialForm);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("We could not save this note. Please try again.");
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
        className="button button-filled absolute top-24 right-5 z-20 flex gap-2 items-center">
        <Plus />
        Add a Note
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
            Create a new note
          </h2>
          <p className="mt-1 text-sm text-neutral-600" id="dialog-description">
            Leave a note for your future self, to one day wash up on the beach.
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

            {error ? <div className="text-sm text-red-500">{error}</div> : null}

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="button button-filled"
                disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save note"}
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
