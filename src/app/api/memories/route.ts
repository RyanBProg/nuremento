import { auth } from "@clerk/nextjs/server";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { getS3Client } from "@/lib/aws/s3Client";
import { optimiseImage } from "@/lib/sharp/optimiseImage";
import { metadataSchema } from "@/lib/zod/schemas";
import { createSignedUrlForKey } from "@/lib/storage";
import { checkMemoriesRateLimit } from "@/lib/rate-limit";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_BYTES_TEXT,
  SUPPORTED_IMAGE_MIME_TYPES,
  SUPPORTED_IMAGE_MIME_TYPES_TEXT,
} from "@/lib/constants";

export const runtime = "nodejs";

const bucketName = process.env.AWS_BUCKET_NAME;

if (!bucketName) {
  throw new Error("AWS_BUCKET_NAME is not configured.");
}

async function cleanupUploads(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const client = getS3Client();

  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  );
}

type MemoryRow = typeof memories.$inferSelect;

async function getMemoryForUser(memoryId: string, userId: string) {
  const [record] = await db
    .select()
    .from(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.clerkId, userId)))
    .limit(1);

  return (record as MemoryRow | undefined) ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkMemoriesRateLimit(userId);

    if (!rateLimit.success) {
      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((rateLimit.reset - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          error:
            "You've reached the limit for logging memories. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
          },
        }
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart form data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const metadataRaw = formData.get("metadata");

    if (typeof metadataRaw !== "string") {
      return NextResponse.json(
        { error: "Missing metadata payload" },
        { status: 400 }
      );
    }

    let metadataJson: unknown;

    try {
      metadataJson = JSON.parse(metadataRaw);
    } catch {
      return NextResponse.json(
        { error: "Metadata payload is not valid JSON." },
        { status: 400 }
      );
    }

    const metadata = metadataSchema.parse(metadataJson);

    const imageEntry = formData.get("image");
    let imageFile: File | null = null;

    if (imageEntry !== null) {
      if (!(imageEntry instanceof File)) {
        return NextResponse.json(
          { error: "Invalid image upload." },
          { status: 400 }
        );
      }

      if (imageEntry.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          {
            error: `Image size too large. Please choose one up to ${MAX_IMAGE_BYTES_TEXT}.`,
          },
          { status: 400 }
        );
      }

      imageFile = imageEntry;
    }

    const s3 = getS3Client();
    const memoryId = randomUUID();
    const uploadedKeys: string[] = [];
    let imageKey: string | null = null;
    let thumbnailKey: string | null = null;

    try {
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileType = await fileTypeFromBuffer(buffer);

        if (!fileType || !SUPPORTED_IMAGE_MIME_TYPES.has(fileType.mime)) {
          return NextResponse.json(
            {
              error: `Only ${SUPPORTED_IMAGE_MIME_TYPES_TEXT} uploads are supported.`,
            },
            { status: 400 }
          );
        }

        const { main, thumbnail } = await optimiseImage(buffer);
        const baseKey = `${userId}/memories/${memoryId}/${randomUUID()}`;
        const objectKey = `${baseKey}.webp`;
        const thumbKey = `${baseKey}-thumb.webp`;

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: main,
            ContentType: "image/webp",
            ACL: "private",
          })
        );

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbKey,
            Body: thumbnail,
            ContentType: "image/webp",
            ACL: "private",
          })
        );

        uploadedKeys.push(objectKey, thumbKey);
        imageKey = objectKey;
        thumbnailKey = thumbKey;
      }

      await db.insert(memories).values({
        id: memoryId,
        clerkId: userId,
        title: metadata.title,
        description: metadata.description,
        occurredOn: metadata.occurredOn,
        location: metadata.location,
        mood: metadata.mood,
        imageKey,
        imageThumbnailKey: thumbnailKey,
      });
    } catch (error) {
      await cleanupUploads(uploadedKeys);
      throw error;
    }

    const thumbnailUrl = thumbnailKey
      ? await createSignedUrlForKey(thumbnailKey)
      : null;

    return NextResponse.json({
      ok: true,
      memoryId,
      imageKey,
      imageThumbnailKey: thumbnailKey,
      thumbnailUrl,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error("Unexpected error handling memory upload", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memoryId = req.nextUrl.searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json(
        { error: "Memory id is required." },
        { status: 400 }
      );
    }

    const existing = await getMemoryForUser(memoryId, userId);

    if (!existing) {
      return NextResponse.json({ error: "Memory not found." }, { status: 404 });
    }

    const keysToDelete = [existing.imageKey, existing.imageThumbnailKey].filter(
      (value): value is string => Boolean(value)
    );

    if (keysToDelete.length > 0) {
      await cleanupUploads(keysToDelete);
    }

    await db
      .delete(memories)
      .where(and(eq(memories.id, memoryId), eq(memories.clerkId, userId)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error deleting memory", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memoryId = req.nextUrl.searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json(
        { error: "Memory id is required." },
        { status: 400 }
      );
    }

    const existing = await getMemoryForUser(memoryId, userId);

    if (!existing) {
      return NextResponse.json({ error: "Memory not found." }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart form data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const metadataRaw = formData.get("metadata");

    if (typeof metadataRaw !== "string") {
      return NextResponse.json(
        { error: "Missing metadata payload" },
        { status: 400 }
      );
    }

    let metadataJson: unknown;

    try {
      metadataJson = JSON.parse(metadataRaw);
    } catch {
      return NextResponse.json(
        { error: "Metadata payload is not valid JSON." },
        { status: 400 }
      );
    }

    const metadata = metadataSchema.parse(metadataJson);

    const imageEntry = formData.get("image");
    let imageFile: File | null = null;

    if (imageEntry !== null) {
      if (!(imageEntry instanceof File)) {
        return NextResponse.json(
          { error: "Invalid image upload." },
          { status: 400 }
        );
      }

      if (imageEntry.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          {
            error: `Image size too large. Please choose one up to ${MAX_IMAGE_BYTES_TEXT}.`,
          },
          { status: 400 }
        );
      }

      imageFile = imageEntry;
    }

    const s3 = getS3Client();
    const uploadedKeys: string[] = [];
    let imageKey = existing.imageKey;
    let thumbnailKey = existing.imageThumbnailKey;

    try {
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileType = await fileTypeFromBuffer(buffer);

        if (!fileType || !SUPPORTED_IMAGE_MIME_TYPES.has(fileType.mime)) {
          return NextResponse.json(
            {
              error: `Only ${SUPPORTED_IMAGE_MIME_TYPES_TEXT} uploads are supported.`,
            },
            { status: 400 }
          );
        }

        const { main, thumbnail } = await optimiseImage(buffer);
        const baseKey = `${userId}/memories/${memoryId}/${randomUUID()}`;
        const objectKey = `${baseKey}.webp`;
        const thumbKey = `${baseKey}-thumb.webp`;

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: main,
            ContentType: "image/webp",
            ACL: "private",
          })
        );

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbKey,
            Body: thumbnail,
            ContentType: "image/webp",
            ACL: "private",
          })
        );

        uploadedKeys.push(objectKey, thumbKey);
        imageKey = objectKey;
        thumbnailKey = thumbKey;
      }

      await db
        .update(memories)
        .set({
          title: metadata.title,
          description: metadata.description,
          occurredOn: metadata.occurredOn,
          location: metadata.location,
          mood: metadata.mood,
          imageKey,
          imageThumbnailKey: thumbnailKey,
        })
        .where(and(eq(memories.id, memoryId), eq(memories.clerkId, userId)));
    } catch (error) {
      await cleanupUploads(uploadedKeys);
      throw error;
    }

    if (imageFile) {
      const previousKeys = [
        existing.imageKey,
        existing.imageThumbnailKey,
      ].filter((key): key is string => Boolean(key));

      if (previousKeys.length > 0) {
        try {
          await cleanupUploads(previousKeys);
        } catch (cleanupError) {
          console.error("Failed to remove previous memory image", cleanupError);
        }
      }
    }

    const thumbnailUrl = thumbnailKey
      ? await createSignedUrlForKey(thumbnailKey)
      : null;

    return NextResponse.json({
      ok: true,
      memoryId,
      title: metadata.title,
      description: metadata.description,
      occurredOn: metadata.occurredOn,
      location: metadata.location,
      mood: metadata.mood,
      imageKey,
      imageThumbnailKey: thumbnailKey,
      thumbnailUrl,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error("Unexpected error updating memory", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
