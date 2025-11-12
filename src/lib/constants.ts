export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_BYTES_TEXT = "8MB";

export const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const SUPPORTED_IMAGE_MIME_TYPES_TEXT = "jpeg, png, webp, heic, heif";

export const MAX_USER_TIMECAPSULE_QTY = 10;
export const MAX_TIMECAPSULE_FUTURE_DAYS = 183; // ~6 months
