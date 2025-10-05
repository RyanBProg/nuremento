"use client";

import { type FormEvent, useRef, useState } from "react";

import {
  FormImageUpload,
  FORM_IMAGE_UPLOAD_MAX_IMAGES,
  FORM_IMAGE_UPLOAD_MAX_TOTAL_BYTES,
  type FormImageUploadHandle,
  type FormImageUploadImage,
  type FormImageUploadSelection,
} from "./FormImageUpload";

export function NewMemoryForm() {
  const uploadRef = useRef<FormImageUploadHandle | null>(null);
  const [mediaFiles, setMediaFiles] = useState<FormImageUploadImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleImagesChange(selection: FormImageUploadSelection) {
    setMediaFiles(selection.images);
    setCoverImageId(selection.coverImageId);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const form = event.currentTarget;
    const rawFormData = new FormData(form);
    const totalBytes = mediaFiles.reduce((sum, item) => sum + item.file.size, 0);

    if (mediaFiles.length > FORM_IMAGE_UPLOAD_MAX_IMAGES) {
      setError(`You can upload up to ${FORM_IMAGE_UPLOAD_MAX_IMAGES} images.`);
      return;
    }

    if (totalBytes > FORM_IMAGE_UPLOAD_MAX_TOTAL_BYTES) {
      setError(
        `Total image size cannot exceed ${(FORM_IMAGE_UPLOAD_MAX_TOTAL_BYTES / 1024 / 1024).toFixed(0)} MB.`
      );
      return;
    }
    const coverImageEntry =
      coverImageId !== null
        ? mediaFiles.find((item) => item.id === coverImageId) ??
          mediaFiles[0] ??
          null
        : mediaFiles[0] ?? null;

    const metadata = {
      title: rawFormData.get("title")?.toString().trim() ?? "",
      description: rawFormData.get("description")?.toString().trim() || null,
      occurredOn: rawFormData.get("occurredOn")?.toString() || null,
      location: rawFormData.get("location")?.toString().trim() || null,
      mood: rawFormData.get("mood")?.toString().trim() || null,
      coverImageKey: coverImageEntry ? coverImageEntry.file.name : null,
      coverImageUrl: null,
      media: mediaFiles.map((item) => ({
        key: item.file.name,
      })),
    };

    if (!metadata.title) {
      setError("Please give this memory a title.");
      return;
    }

    const submission = new FormData();
    submission.append("metadata", JSON.stringify(metadata));
    submission.append("title", metadata.title);
    if (metadata.description) {
      submission.append("description", metadata.description);
    }
    if (metadata.occurredOn) {
      submission.append("occurredOn", metadata.occurredOn);
    }
    if (metadata.location) {
      submission.append("location", metadata.location);
    }
    if (metadata.mood) {
      submission.append("mood", metadata.mood);
    }
    if (coverImageEntry) {
      submission.append("coverImageFileName", coverImageEntry.file.name);
    }

    mediaFiles.forEach((item) => {
      submission.append("mediaFiles", item.file, item.file.name);
    });

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/memories", {
        method: "POST",
        body: submission,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      uploadRef.current?.reset();
      setMediaFiles([]);
      setCoverImageId(null);
      form.reset();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("We could not save this memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="rounded-md border  bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
          placeholder="Give your memory a name"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="rounded-md border  bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
          placeholder="Write about the moment"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="occurredOn">
          Date (optional)
        </label>
        <input
          id="occurredOn"
          name="occurredOn"
          type="date"
          className="rounded-md border  bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
        />
        <p className="text-xs">
          If you only know the approximate timing, pick the closest date you
          remember.
        </p>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="location">
          Location (optional)
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="rounded-md border  bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
          placeholder="Where were you?"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="mood">
          Mood (optional)
        </label>
        <input
          id="mood"
          name="mood"
          type="text"
          className="rounded-md border  bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
          placeholder="How did it feel?"
        />
      </div>

      <FormImageUpload
        ref={uploadRef}
        label="Photos (optional)"
        description="Upload JPG, PNG, or HEIC files. They stay on your device until you submit."
        onChange={handleImagesChange}
      />

      {error ? (
        <p className="text-sm  font-medium text-red-600">{error}</p>
      ) : success ? (
        <p className="text-sm font-medium text-green-600">
          Memory saved! Check the console for details.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-black text-white text-medium text-base px-5 py-3 shadow-sm rounded-full transition-colors hover:bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Saving…" : "Save memory"}
      </button>
    </form>
  );
}
