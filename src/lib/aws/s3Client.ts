import { S3Client } from "@aws-sdk/client-s3";

export function getS3Client() {
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
