"use client";

import { useEffect, useRef, useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MemoryImageUpload, {
  type MemoryImageSelection,
} from "@/components/memory-form/MemoryImageUpload";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_BYTES_TEXT,
  SUPPORTED_IMAGE_MIME_TYPES_TEXT,
} from "@/lib/constants";
import { Sparkles } from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  occurredOn: "",
  location: "",
  mood: "",
};

export type MemoryFormData = {
  id: string;
  title: string;
  description: string | null;
  occurredOn: string | null;
  location: string | null;
  mood: string | null;
  thumbnailUrl: string | null;
};

type Props = {
  mode: "create" | "edit";
  memory?: MemoryFormData;
};

export default function MemoryFormModal({ mode, memory }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState(() =>
    memory
      ? {
          title: memory.title ?? "",
          description: memory.description ?? "",
          occurredOn: memory.occurredOn ?? "",
          location: memory.location ?? "",
          mood: memory.mood ?? "",
        }
      : emptyForm
  );
  const [imageFile, setImageFile] = useState<MemoryImageSelection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const isEditing = Boolean(memory?.id);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues(
      memory
        ? {
            title: memory.title ?? "",
            description: memory.description ?? "",
            occurredOn: memory.occurredOn ?? "",
            location: memory.location ?? "",
            mood: memory.mood ?? "",
          }
        : emptyForm
    );

    setError(null);

    setImageFile((current) => {
      if (current) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return null;
    });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, [isOpen, memory]);

  useEffect(() => {
    return () => {
      if (imageFile) {
        URL.revokeObjectURL(imageFile.previewUrl);
      }
    };
  }, [imageFile]);

  function handleCloseModal() {
    setIsOpen(false);
    setError(null);

    if (imageFile) {
      URL.revokeObjectURL(imageFile.previewUrl);
    }
    setImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsOpen(false);

    if (isOpen) {
      dialogRef.current?.showModal();
      document.addEventListener("keydown", onKeyDown);
    } else {
      dialogRef.current?.close();
    }

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError(
        `Image size too large. Please choose one up to ${MAX_IMAGE_BYTES_TEXT}.`
      );
      event.target.value = "";
      return;
    }

    setError(null);

    setImageFile((current) => {
      if (current) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        file,
        previewUrl: URL.createObjectURL(file),
      } satisfies MemoryImageSelection;
    });
  }

  function handleRemoveImage() {
    if (imageFile) {
      URL.revokeObjectURL(imageFile.previewUrl);
    }
    setImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = formValues.title.trim();
    const trimmedDescription = formValues.description.trim();

    if (!trimmedTitle) {
      setError("Please give this memory a title.");
      return;
    }

    if (!trimmedDescription) {
      setError("Please describe this memory.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const metadata = {
        title: trimmedTitle,
        description: trimmedDescription,
        occurredOn: formValues.occurredOn ? formValues.occurredOn : null,
        location: formValues.location.trim() || null,
        mood: formValues.mood.trim() || null,
      };

      const submission = new FormData();
      submission.append("metadata", JSON.stringify(metadata));

      if (imageFile) {
        submission.append("image", imageFile.file, imageFile.file.name);
      }

      const endpoint = isEditing
        ? `/api/memories?id=${memory!.id}`
        : "/api/memories";

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: submission,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "We could not save this memory. Please try again.";
        setError(message);
        return;
      }

      if (imageFile) {
        URL.revokeObjectURL(imageFile.previewUrl);
      }

      setImageFile(null);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      handleCloseModal();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("We could not save this memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(key: keyof typeof formValues, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerateDescription() {
    const trimmedTitle = formValues.title.trim();
    const trimmedDescription = formValues.description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError("Add a title and description before using AI re-write.");
      return;
    }

    setIsGeneratingDescription(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-tools/description-helper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "We could not generate a description. Please try again.";
        setError(message);
        return;
      }

      const payload = (await response.json()) as {
        query?: string;
      };

      if (!payload.query) {
        setError("The AI response was empty. Please try again.");
        return;
      }

      setFormValues((prev) => ({
        ...prev,
        description: (payload.query ?? "").trim(),
      }));
    } catch (err) {
      console.error(err);
      setError("We could not generate a description. Please try again.");
    } finally {
      setIsGeneratingDescription(false);
    }
  }

  return (
    <>
      {mode === "create" ? (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="button button-filled w-fit">
          Log a memory
        </button>
      ) : (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 button button-filled">
          Edit
        </button>
      )}

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
          className="m-auto overflow-y-scroll max-h-full w-full max-w-xl rounded-2xl bg-white p-6 backdrop:bg-black/50">
          <h2 className="text-xl font-semibold" id="dialog-title">
            {isEditing ? "Edit memory" : "Log a new memory"}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            {isEditing
              ? "Update the details below and save your changes."
              : "Capture the moment while it is still fresh."}
          </p>

          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <label className="mb-4 space-y-2 text-sm font-medium sm:col-span-2">
                <span className="block">Title</span>
                <input
                  name="title"
                  type="text"
                  value={formValues.title}
                  onChange={(event) =>
                    handleChange("title", event.target.value)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  required
                />
              </label>

              <label className="mb-6 space-y-2 text-sm font-medium sm:col-span-2">
                <div className="flex justify-between items-end">
                  <span className="block">Description</span>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDescription || isSubmitting}
                    className="button-ai">
                    <Sparkles size={16} />
                    <span>
                      {isGeneratingDescription ? "Thinking..." : "AI re-write"}
                    </span>
                  </button>
                </div>
                <textarea
                  name="description"
                  rows={4}
                  value={formValues.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  required
                />
              </label>

              <label className="mb-6 space-y-2 text-sm font-medium">
                <span className="block">Date (optional)</span>
                <input
                  name="occurredOn"
                  type="date"
                  value={formValues.occurredOn}
                  onChange={(event) =>
                    handleChange("occurredOn", event.target.value)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                />
              </label>

              <label className="mb-6 space-y-2 text-sm font-medium">
                <span className="block">Location (optional)</span>
                <input
                  name="location"
                  type="text"
                  value={formValues.location}
                  onChange={(event) =>
                    handleChange("location", event.target.value)
                  }
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                />
              </label>

              <label className="mb-6 space-y-2 text-sm font-medium sm:col-span-2">
                <span className="block">
                  Mood (optional)
                  <span className="font-light">
                    {" "}
                    - one or two words to capture the feeling
                  </span>
                </span>
                <input
                  name="mood"
                  type="text"
                  value={formValues.mood}
                  onChange={(event) => handleChange("mood", event.target.value)}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                />
              </label>
            </div>

            <div className="mb-6 space-y-3">
              <MemoryImageUpload
                label={isEditing ? "Replace photo" : "Add a photo (optional)"}
                description={`Image formats ${SUPPORTED_IMAGE_MIME_TYPES_TEXT} only - up to ${MAX_IMAGE_BYTES_TEXT}.`}
                handleImageUpload={handleImageUpload}
                imageFile={imageFile}
                handleRemoveImage={handleRemoveImage}
                imageInputRef={imageInputRef}
              />

              {!imageFile && memory?.thumbnailUrl ? (
                <div className="relative h-60 w-60 overflow-hidden rounded-lg border">
                  <Image
                    src={memory.thumbnailUrl}
                    alt={memory.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="mb-6 text-sm text-red-500">{error}</p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                className="button button-filled"
                disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving…"
                  : isEditing
                  ? "Save changes"
                  : "Create memory"}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
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
