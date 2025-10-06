"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

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

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function formatDateForDisplay(value: string | null) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function MemoriesList({ initialMemories }: MemoriesListProps) {
  const router = useRouter();
  const [memories, setMemories] = useState(initialMemories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    occurredOn: "",
    location: "",
    mood: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  function resetEditState() {
    setEditingId(null);
    setFormValues({
      title: "",
      description: "",
      occurredOn: "",
      location: "",
      mood: "",
    });
    setFormError(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }
    setNewImageFile(null);
    setNewImagePreview(null);
  }

  function handleStartEdit(memory: MemoryRecord) {
    setEditingId(memory.id);
    setFormValues({
      title: memory.title,
      description: memory.description ?? "",
      occurredOn: memory.occurredOn ?? "",
      location: memory.location ?? "",
      mood: memory.mood ?? "",
    });
    setFormError(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }
    setNewImageFile(null);
    setNewImagePreview(null);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Only image files are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Image size too large. Please choose one up to 10MB.");
      event.target.value = "";
      return;
    }

    setFormError(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    const trimmedTitle = formValues.title.trim();
    const trimmedDescription = formValues.description.trim();

    if (!trimmedTitle) {
      setFormError("Title is required.");
      return;
    }

    if (!trimmedDescription) {
      setFormError("Description is required.");
      return;
    }

    const metadata = {
      title: trimmedTitle,
      description: trimmedDescription,
      occurredOn: formValues.occurredOn ? formValues.occurredOn : null,
      location: formValues.location.trim() || null,
      mood: formValues.mood.trim() || null,
    };

    const submission = new FormData();
    submission.append("metadata", JSON.stringify(metadata));

    if (newImageFile) {
      submission.append("image", newImageFile, newImageFile.name);
    }

    setSubmittingId(editingId);
    setFormError(null);
    setGlobalError(null);

    try {
      const response = await fetch(`/api/memories?id=${editingId}`, {
        method: "PUT",
        body: submission,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const message =
          typeof payload?.error === "string"
            ? payload?.error
            : "We could not update this memory. Please try again.";
        setFormError(message);
        return;
      }

      setMemories((items) =>
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: metadata.title,
                description: metadata.description,
                occurredOn: metadata.occurredOn,
                occurredOnDisplay: formatDateForDisplay(metadata.occurredOn),
                location: metadata.location,
                mood: metadata.mood,
              }
            : item
        )
      );

      resetEditState();
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormError("We could not update this memory. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  }

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
      if (editingId === memory.id) {
        resetEditState();
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      setGlobalError("We could not delete this memory. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {globalError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {globalError}
        </div>
      ) : null}

      {memories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          You haven’t created any memories yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => {
            const isEditing = editingId === memory.id;
            const isSubmitting = submittingId === memory.id;
            const isDeleting = deletingId === memory.id;

            return (
              <article
                key={memory.id}
                className="flex flex-col overflow-hidden rounded-lg border shadow-sm">
                {isEditing ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    {newImagePreview ? (
                      <Image
                        src={newImagePreview}
                        alt={formValues.title || memory.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : memory.thumbnailUrl ? (
                      <Image
                        src={memory.thumbnailUrl}
                        alt={memory.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                        No photo added
                      </div>
                    )}
                  </div>
                ) : memory.thumbnailUrl ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={memory.thumbnailUrl}
                      alt={memory.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                    No photo added
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-3 p-4">
                  {isEditing ? (
                    <form className="space-y-3" onSubmit={handleUpdate}>
                      <div className="space-y-1">
                        <label
                          className="text-xs font-medium"
                          htmlFor={`title-${memory.id}`}>
                          Title
                        </label>
                        <input
                          id={`title-${memory.id}`}
                          name="title"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={formValues.title}
                          onChange={(event) =>
                            setFormValues((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          className="text-xs font-medium"
                          htmlFor={`description-${memory.id}`}>
                          Description
                        </label>
                        <textarea
                          id={`description-${memory.id}`}
                          name="description"
                          rows={3}
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={formValues.description}
                          onChange={(event) =>
                            setFormValues((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label
                            className="text-xs font-medium"
                            htmlFor={`occurredOn-${memory.id}`}>
                            Date
                          </label>
                          <input
                            id={`occurredOn-${memory.id}`}
                            name="occurredOn"
                            type="date"
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={formValues.occurredOn}
                            onChange={(event) =>
                              setFormValues((prev) => ({
                                ...prev,
                                occurredOn: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="text-xs font-medium"
                            htmlFor={`location-${memory.id}`}>
                            Location
                          </label>
                          <input
                            id={`location-${memory.id}`}
                            name="location"
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={formValues.location}
                            onChange={(event) =>
                              setFormValues((prev) => ({
                                ...prev,
                                location: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label
                            className="text-xs font-medium"
                            htmlFor={`mood-${memory.id}`}>
                            Mood
                          </label>
                          <input
                            id={`mood-${memory.id}`}
                            name="mood"
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={formValues.mood}
                            onChange={(event) =>
                              setFormValues((prev) => ({
                                ...prev,
                                mood: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label
                            className="text-xs font-medium"
                            htmlFor={`image-${memory.id}`}>
                            Replace photo (optional)
                          </label>
                          <input
                            id={`image-${memory.id}`}
                            name="image"
                            type="file"
                            accept="image/*"
                            className="w-full text-sm"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>

                      {formError ? (
                        <p className="text-sm text-destructive">{formError}</p>
                      ) : null}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={isSubmitting}>
                          {isSubmitting ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          className="flex-1 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                          onClick={resetEditState}
                          disabled={isSubmitting}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h2 className="text-lg font-medium">{memory.title}</h2>
                        <p className="text-xs text-muted-foreground">
                          {typeof memory.occurredOnDisplay === "string" &&
                            memory.occurredOnDisplay}
                          {memory.location ? ` • ${memory.location}` : ""}
                        </p>
                        {memory.mood ? (
                          <p className="text-xs text-muted-foreground">
                            Mood: {memory.mood}
                          </p>
                        ) : null}
                      </div>
                      {memory.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {memory.description}
                        </p>
                      ) : null}

                      <div className="mt-auto flex gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                          onClick={() => handleStartEdit(memory)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="flex-1 rounded-full border border-destructive px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-70"
                          onClick={() => handleDelete(memory)}
                          disabled={isDeleting}>
                          {isDeleting ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
