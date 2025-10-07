"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import MemoryImageUpload, {
  type MemoryImageSelection,
} from "./MemoryImageUpload";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_BYTES_TEXT,
  SUPPORTED_IMAGE_MIME_TYPES_TEXT,
} from "@/lib/constants";

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

type MemoryFormModalProps = {
  trigger: (props: { open: () => void }) => ReactNode;
  memory?: MemoryFormData;
};

export function MemoryFormModal({ trigger, memory }: MemoryFormModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  function closeModal() {
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

  function handleOpen() {
    setIsOpen(true);
  }

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

      closeModal();
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

  return (
    <>
      {trigger({ open: handleOpen })}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="overflow-y-scroll max-h-full relative w-full max-w-2xl rounded-2xl bg-white p-6">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 text-sm text-neutral-600 transition hover:text-black"
              aria-label="Close">
              ✕
            </button>

            <h2 className="text-xl font-semibold">
              {isEditing ? "Edit memory" : "Log a new memory"}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {isEditing
                ? "Update the details below and save your changes."
                : "Capture the moment while it is still fresh."}
            </p>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium sm:col-span-2">
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

                <label className="space-y-2 text-sm font-medium sm:col-span-2">
                  <span className="block">Description</span>
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

                <label className="space-y-2 text-sm font-medium">
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

                <label className="space-y-2 text-sm font-medium">
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

                <label className="space-y-2 text-sm font-medium sm:col-span-2">
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
                    onChange={(event) =>
                      handleChange("mood", event.target.value)
                    }
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  />
                </label>
              </div>

              <div className="space-y-3">
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
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving…"
                    : isEditing
                    ? "Save changes"
                    : "Create memory"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-muted"
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
