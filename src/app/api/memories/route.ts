import { auth } from "@clerk/nextjs/server";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";

import { db } from "@/db/client";
import { memories } from "@/db/schema";
import { getS3Client } from "@/lib/aws/s3Client";
import { optimiseImage } from "@/lib/sharp/optimiseImage";
import { metadataSchema } from "@/lib/zod/schemas";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

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
          { error: "Image size too large. Please choose one up to 10MB." },
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
            { error: "Only image uploads are supported." },
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

    return NextResponse.json({ ok: true, memoryId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error("Unexpected error handling memory upload", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export function DELETE() {
  // route to delete a memory and its images (main & thumbnail) in s3
}

export function PUT() {
  // route to edit a memory
  // carry out all the same checks as the POST route, maybe break out shared functions
  // if a new image is added, remeber to find and delete the old one first
}
