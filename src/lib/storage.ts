import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type DeleteObjectsCommandInput,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let cachedClient: S3Client | null = null;

function resolveBucketName() {
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

  return { accessKeyId, secretAccessKey } as const;
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

export function getBucketName() {
  return resolveBucketName();
}

export async function putObject(params: PutObjectCommandInput) {
  const client = getS3Client();
  await client.send(new PutObjectCommand(params));
}

export async function deleteObjects(input: DeleteObjectsCommandInput) {
  if (!input.Delete?.Objects?.length) {
    return;
  }

  const client = getS3Client();
  await client.send(new DeleteObjectsCommand(input));
}

export async function createSignedUrlForKey(
  key: string,
  expiresInSeconds = 300
) {
  const client = getS3Client();
  const bucket = getBucketName();

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
