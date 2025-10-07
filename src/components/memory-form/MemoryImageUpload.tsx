import Image from "next/image";
import { X } from "lucide-react";
import { ChangeEvent, RefObject } from "react";

export type MemoryImageSelection = {
  file: File;
  previewUrl: string;
};

type Props = {
  label: string;
  description: string;
  handleImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  imageFile: MemoryImageSelection | null;
  handleRemoveImage: () => void;
  imageInputRef: RefObject<HTMLInputElement | null>;
};

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MemoryImageUpload({
  label,
  description,
  handleImageUpload,
  imageFile,
  handleRemoveImage,
  imageInputRef,
}: Props) {
  return (
    <div className="space-y-3">
      <label className="inline-block text-sm font-medium" htmlFor="image">
        {label}
      </label>
      <input
        id="image"
        name="image"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={imageInputRef}
        className="block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border file:px-3 file:py-2 file:text-sm file:font-medium focus:outline-none"
      />
      {description ? <p className="text-xs">{description}</p> : null}

      {imageFile ? (
        <div className="space-y-2 rounded-lg border p-3 w-min">
          <div className={`relative h-60 w-60 overflow-hidden rounded-md`}>
            <Image
              src={imageFile.previewUrl}
              alt={imageFile.file.name}
              fill={true}
              className="mx-auto object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 flex justify-center items-center border size-8 rounded-full bg-white transition-colors hover:cursor-pointer hover:bg-red-500"
              aria-label={`Remove ${imageFile.file.name}`}>
              <X size={16} />
            </button>
          </div>
          <div className="w-60 flex items-center justify-between text-xs gap-5">
            <span className="max-w-40 truncate" title={imageFile.file.name}>
              {imageFile.file.name}
            </span>
            <span>{formatFileSize(imageFile.file.size)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
