"use client";

import { Star, X } from "lucide-react";
import Image from "next/image";
import {
  forwardRef,
  type ChangeEvent,
  type ForwardedRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type FormImageUploadImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type FormImageUploadSelection = {
  images: FormImageUploadImage[];
  coverImageId: string | null;
};

export type FormImageUploadHandle = {
  reset: () => void;
};

type FormImageUploadProps = {
  label?: string;
  description?: string;
  onChange?: (selection: FormImageUploadSelection) => void;
};

function createImageId(file: File) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export const FORM_IMAGE_UPLOAD_MAX_IMAGES = 5;
export const FORM_IMAGE_UPLOAD_MAX_TOTAL_BYTES = 20 * 1024 * 1024;

const MAX_IMAGES = FORM_IMAGE_UPLOAD_MAX_IMAGES;
const MAX_TOTAL_BYTES = FORM_IMAGE_UPLOAD_MAX_TOTAL_BYTES;

export const FormImageUpload = forwardRef(function FormImageUpload(
  { label = "Photos", description, onChange }: FormImageUploadProps,
  ref: ForwardedRef<FormImageUploadHandle>
) {
  const [images, setImages] = useState<FormImageUploadImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const previousImagesRef = useRef<FormImageUploadImage[]>([]);
  const inputId = useId();

  useImperativeHandle(ref, () => ({
    reset: () => {
      setImages((current) => {
        current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        return [];
      });
      setCoverImageId(null);
      setError(null);
      setTotalBytes(0);
    },
  }));

  useEffect(() => {
    previousImagesRef.current = images;
  }, [images]);

  useEffect(() => {
    if (!onChange) {
      return;
    }

    onChange({ images, coverImageId });
  }, [images, coverImageId, onChange]);

  useEffect(() => {
    return () => {
      previousImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl)
      );
    };
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      input.value = "";
      return;
    }

    setImages((current) => {
      if (current.length >= MAX_IMAGES) {
        setError(`You can upload up to ${MAX_IMAGES} images. Remove one to add another.`);
        input.value = "";
        return current;
      }

      let nextTotal = current.reduce((sum, item) => sum + item.file.size, 0);
      const spaceLeft = Math.max(0, MAX_IMAGES - current.length);
      const additions: FormImageUploadImage[] = [];
      let rejected = false;

      for (const file of files) {
        if (additions.length >= spaceLeft) {
          rejected = true;
          break;
        }

        if (nextTotal + file.size > MAX_TOTAL_BYTES) {
          rejected = true;
          continue;
        }

        const image = {
          id: createImageId(file),
          file,
          previewUrl: URL.createObjectURL(file),
        } satisfies FormImageUploadImage;

        additions.push(image);
        nextTotal += file.size;
      }

      if (additions.length === 0) {
        setError(
          rejected
            ? `Total image size cannot exceed ${formatFileSize(MAX_TOTAL_BYTES)}. Remove a file or add smaller ones.`
            : null
        );
        input.value = "";
        return current;
      }

      const nextImages = [...current, ...additions];
      setCoverImageId((currentCover) => currentCover ?? additions[0]?.id ?? null);
      setError(
        rejected
          ? `Some files were skipped. You can upload up to ${MAX_IMAGES} images totaling ${formatFileSize(
              MAX_TOTAL_BYTES
            )}.`
          : null
      );
      setTotalBytes(nextTotal);
      input.value = "";
      return nextImages;
    });
  }

  function handleRemove(id: string) {
    setImages((current) => {
      const next = current.filter((image) => {
        if (image.id === id) {
          URL.revokeObjectURL(image.previewUrl);
          return false;
        }

        return true;
      });

      if (next.length === 0) {
        setCoverImageId(null);
      } else if (coverImageId === id) {
        setCoverImageId(next[0]?.id ?? null);
      }

      setTotalBytes(next.reduce((sum, item) => sum + item.file.size, 0));
      setError(null);

      return next;
    });
  }

  function handleCoverChange(id: string) {
    setCoverImageId(id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" htmlFor={inputId}>
          {label}
        </label>
        {images.length > 0 ? (
          <span className="text-xs">
            {images.length} selected • {formatFileSize(totalBytes)}
          </span>
        ) : null}
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border file:px-3 file:py-2 file:text-sm file:font-medium focus:outline-none"
      />
      {description ? <p className="text-xs">{description}</p> : null}
      {error ? <p className="text-xs text-error">{error}</p> : null}

      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const isCover = coverImageId === image.id;

            return (
              <div key={image.id} className="space-y-2 rounded-lg border p-3">
                <div className={`relative h-40 overflow-hidden rounded-md`}>
                  <Image
                    src={image.previewUrl}
                    alt={image.file.name}
                    fill={true}
                    className="mx-auto object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(image.id)}
                    className="absolute right-2 top-2 flex justify-center items-center border size-8 rounded-full bg-white transition-colors hover:cursor-pointer hover:bg-red-500"
                    aria-label={`Remove ${image.file.name}`}>
                    <X size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCoverChange(image.id)}
                    className={`absolute left-2 top-2 flex justify-center items-center border size-8 rounded-full transition-colors ${
                      isCover
                        ? "bg-amber-500 hover:cursor-auto"
                        : "bg-white hover:cursor-pointer hover:bg-amber-500"
                    }`}
                    aria-label={`Remove ${image.file.name}`}>
                    <Star size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate" title={image.file.name}>
                    {image.file.name}
                  </span>
                  <span>{formatFileSize(image.file.size)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
