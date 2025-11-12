import {
  DeleteObjectsCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let cachedClient: S3Client | null = null;

export function resolveBucketName() {
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not configured.");
  }
  return bucket;
}

function resolveCredentials() {
  const accessKeyId = process.env.AWS_USER_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_USER_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured.");
  }

  return { accessKeyId, secretAccessKey };
}

export function getS3Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const region = process.env.AWS_REGION;

  if (!region) {
    throw new Error("AWS_REGION is not configured.");
  }

  const credentials = resolveCredentials();

  cachedClient = new S3Client({ region, credentials });
  return cachedClient;
}

export async function createSignedUrlForKey(
  key: string,
  expiresInSeconds = 300
) {
  const client = getS3Client();
  const bucket = resolveBucketName();

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function cleanupUploads(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const bucketName = resolveBucketName();

  let client: S3Client | null = null;
  if (cachedClient) {
    client = cachedClient;
  } else {
    client = getS3Client();
  }

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
