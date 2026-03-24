import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Cloudflare R2 configuration via environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "lensparty-photos";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ""; // Custom domain or r2.dev URL

const isR2Configured = R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY;

let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  console.log("[R2] Cloud storage configured successfully");
} else {
  console.log("[R2] Cloud storage not configured — falling back to base64 in SQLite");
}

export function isCloudStorageEnabled(): boolean {
  return !!s3Client;
}

/**
 * Upload a file to R2 and return the public URL
 */
export async function uploadToR2(
  buffer: Buffer,
  mimeType: string,
  eventId: number,
  originalFilename: string
): Promise<string> {
  if (!s3Client) throw new Error("R2 not configured");

  // Generate a unique key: events/{eventId}/{randomHash}-{filename}
  const hash = crypto.randomBytes(8).toString("hex");
  const ext = originalFilename.split(".").pop() || "jpg";
  const key = `events/${eventId}/${hash}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // Return the public URL
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  // Fallback: return the key and serve via our API
  return `/api/photos/r2/${key}`;
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(url: string): Promise<void> {
  if (!s3Client) return;

  // Extract the key from the URL
  let key = url;
  if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
    key = url.replace(`${R2_PUBLIC_URL}/`, "");
  } else if (url.startsWith("/api/photos/r2/")) {
    key = url.replace("/api/photos/r2/", "");
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (e) {
    console.error("[R2] Failed to delete:", key, e);
  }
}

/**
 * Get a signed URL for reading a file (when no public URL is set)
 */
export async function getSignedReadUrl(key: string): Promise<string> {
  if (!s3Client) throw new Error("R2 not configured");

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 3600 } // 1 hour
  );
}
