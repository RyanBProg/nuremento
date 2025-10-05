import { auth } from "@clerk/nextjs/server";
import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { db } from "@/db/client";
import { memories, type MemoryAsset } from "@/db/schema";

export const runtime = "nodejs";

const MAX_IMAGES = 5;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const bucketName = process.env.AWS_BUCKET_NAME;
if (!bucketName) {
  throw new Error("AWS_REGION is not configured.");
}

const metadataSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  occurredOn: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "occurredOn must be YYYY-MM-DD",
    }),
  location: z.string().optional().nullable(),
  mood: z.string().optional().nullable(),
  coverImageKey: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  media: z
    .array(z.object({ key: z.string().min(1) }))
    .max(MAX_IMAGES, `You can upload up to ${MAX_IMAGES} images.`)
    .optional()
    .default([]),
});

type UploadedImage = {
  fileName: string;
  key: string;
  thumbnailKey: string;
};

function getS3Client() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_USER_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_USER_SECRET_KEY;
  if (!region) {
    throw new Error("AWS_REGION is not configured.");
  }
  if (!accessKeyId) {
    throw new Error("AWS_REGION is not configured.");
  }
  if (!secretAccessKey) {
    throw new Error("AWS_REGION is not configured.");
  }

  return new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region,
  });
}

async function optimiseImage(buffer: Buffer) {
  const transformer = sharp(buffer).rotate();

  const [main, thumbnail] = await Promise.all([
    transformer
      .clone()
      .resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer(),
    transformer
      .clone()
      .resize({ width: 320, height: 320, fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer(),
  ]);

  return { main, thumbnail };
}

async function cleanupUploads(keys: string[], s3: S3Client) {
  if (keys.length === 0) {
    return;
  }

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  );
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const mediaEntries = formData.getAll("mediaFiles");
    const files: File[] = [];

    for (const entry of mediaEntries) {
      if (!(entry instanceof File)) {
        return NextResponse.json(
          { error: "Invalid media file" },
          { status: 400 }
        );
      }

      files.push(entry);
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_IMAGES} images.` },
        { status: 400 }
      );
    }

    let totalBytes = 0;
    for (const file of files) {
      totalBytes += file.size;

      if (totalBytes > MAX_TOTAL_BYTES) {
        return NextResponse.json(
          {
            error: `Total image size cannot exceed ${(
              MAX_TOTAL_BYTES /
              1024 /
              1024
            ).toFixed(0)} MB.`,
          },
          { status: 400 }
        );
      }

      if (
        !SUPPORTED_IMAGE_TYPES.has(file.type) &&
        !file.type.startsWith("image/")
      ) {
        return NextResponse.json(
          { error: "Only image uploads are supported." },
          { status: 400 }
        );
      }
    }

    if (metadata.media.length !== files.length) {
      return NextResponse.json(
        { error: "Metadata does not match uploaded files." },
        { status: 400 }
      );
    }

    const coverImageFileNameRaw = formData.get("coverImageFileName");
    const coverImageFileName =
      typeof coverImageFileNameRaw === "string" && coverImageFileNameRaw.trim()
        ? coverImageFileNameRaw.trim()
        : null;

    const s3 = getS3Client();
    const memoryId = randomUUID();

    const uploads: UploadedImage[] = [];

    try {
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { main, thumbnail } = await optimiseImage(buffer);
        const baseKey = `${userId}/memories/${memoryId}/${randomUUID()}`;
        const key = `${baseKey}.webp`;
        const thumbnailKey = `${baseKey}-thumb.webp`;

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: main,
            ContentType: "image/webp",
            ACL: "private",
          })
        );

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbnailKey,
            Body: thumbnail,
            ContentType: "image/webp",
            ACL: "private",
          })
        );

        uploads.push({ fileName: file.name, key, thumbnailKey });
      }
    } catch (uploadErr) {
      const keysToDelete = uploads.flatMap((item) => [
        item.key,
        item.thumbnailKey,
      ]);
      await cleanupUploads(keysToDelete, s3);
      throw uploadErr;
    }

    const coverUpload = coverImageFileName
      ? uploads.find((item) => item.fileName === coverImageFileName) ??
        uploads[0] ??
        null
      : uploads[0] ?? null;

    const mediaPayload: MemoryAsset[] = uploads.map((item) => ({
      key: item.key,
      thumbnailKey: item.thumbnailKey,
    }));

    try {
      await db.insert(memories).values({
        id: memoryId,
        clerkId: userId,
        title: metadata.title,
        description: metadata.description?.trim() || null,
        occurredOn: metadata.occurredOn ? metadata.occurredOn : null,
        location: metadata.location?.trim() || null,
        mood: metadata.mood?.trim() || null,
        coverImageKey: coverUpload ? coverUpload.key : null,
        coverImageUrl: null,
        media: mediaPayload,
      });
    } catch (dbErr) {
      const keysToDelete = uploads.flatMap((item) => [
        item.key,
        item.thumbnailKey,
      ]);
      await cleanupUploads(keysToDelete, s3);
      throw dbErr;
    }

    return NextResponse.json({ ok: true, memoryId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error("Unexpected error handling memory upload", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
