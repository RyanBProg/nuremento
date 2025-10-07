import { memories } from "@/db/schema";
import { createSignedUrlForKey } from "@/lib/storage";

export async function resolveThumbnailUrl(
  memory: typeof memories.$inferSelect
) {
  const key = memory.imageThumbnailKey ?? memory.imageKey;

  if (!key) {
    return null;
  }

  try {
    return await createSignedUrlForKey(key);
  } catch (error) {
    console.error("Failed to create signed URL for thumbnail", error);
    return null;
  }
}
