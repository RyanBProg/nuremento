"use client";

import { ChangeEvent, type FormEvent, useRef, useState } from "react";

import MemoryImageUpload from "./MemoryImageUpload";

export type FormImageUploadImage = {
  file: File;
  previewUrl: string;
};

const emptyForm = {
  title: "",
  description: "",
  date: "",
  location: "",
  mood: "",
};

export function NewMemoryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<FormImageUploadImage | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState(emptyForm);

  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      input.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image size too large. Please choose one up to 10MB.");
      input.value = "";
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
      } satisfies FormImageUploadImage;
    });
  };

  const handleRemoveImage = () => {
    if (imageFile) {
      URL.revokeObjectURL(imageFile.previewUrl);
      setImageFile(null);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setError("Please give this memory a title.");
      return;
    }

    const trimmedDescription = formData.description.trim();
    if (!trimmedDescription) {
      setError("Please describe this memory.");
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata = {
        title: trimmedTitle,
        description: trimmedDescription,
        occurredOn: formData.date || null,
        location: formData.location.trim() || null,
        mood: formData.mood.trim() || null,
      };

      const submission = new FormData();
      submission.append("metadata", JSON.stringify(metadata));

      if (imageFile) {
        submission.append("image", imageFile.file, imageFile.file.name);
      }

      const res = await fetch("/api/memories", {
        method: "POST",
        body: submission,
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      if (imageFile) {
        URL.revokeObjectURL(imageFile.previewUrl);
      }

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      setImageFile(null);
      setFormData(emptyForm);
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
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
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
          required
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
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
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
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
          value={formData.location}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, location: e.target.value }))
          }
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
          value={formData.mood}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, mood: e.target.value }))
          }
          className="rounded-md border  bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
          placeholder="How did it feel?"
        />
      </div>

      <MemoryImageUpload
        label="Photos (optional)"
        description="Upload JPG, PNG, or HEIC files. They stay on your device until you submit."
        imageFile={imageFile}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        imageInputRef={imageInputRef}
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
