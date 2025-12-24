import { Client } from "minio";
import {
  MINIO_ENDPOINT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  MINIO_PUBLIC_URL,
} from "$env/static/private";

if (
  !MINIO_ENDPOINT ||
  !MINIO_ACCESS_KEY ||
  !MINIO_SECRET_KEY ||
  !MINIO_BUCKET
) {
  throw new Error("MinIO environment variables are not properly configured");
}

// Parse l'URL correctement
let endPoint: string;
let port: number;
let useSSL: boolean;

if (
  MINIO_ENDPOINT.startsWith("http://") ||
  MINIO_ENDPOINT.startsWith("https://")
) {
  const url = new URL(MINIO_ENDPOINT);
  endPoint = url.hostname;
  port = url.port ? parseInt(url.port) : url.protocol === "https:" ? 443 : 9000;
  useSSL = url.protocol === "https:";
} else {
  // Fallback pour format "hostname:port"
  const parts = MINIO_ENDPOINT.split(":");
  endPoint = parts[0];
  port = parts[1] ? parseInt(parts[1]) : 9000;
  useSSL = false;
}

console.log("MinIO Config:", { endPoint, port, useSSL }); // DEBUG

export const minioClient = new Client({
  endPoint,
  port,
  useSSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

export const BUCKET_NAME = MINIO_BUCKET;

export async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    console.log(`Bucket ${BUCKET_NAME} created`);
  }
}

/**
 * Converts an internal MinIO URL to a publicly accessible URL
 * by replacing the internal hostname with the public URL if configured
 */
export function getPublicUrl(internalUrl: string): string {
  if (!MINIO_PUBLIC_URL) {
    // No public URL configured, return as is
    console.warn('[MinIO] MINIO_PUBLIC_URL not configured, using internal URL');
    return internalUrl;
  }

  try {
    const url = new URL(internalUrl);
    const publicUrl = new URL(MINIO_PUBLIC_URL);

    // Replace the hostname and port with the public URL
    url.hostname = publicUrl.hostname;
    url.protocol = publicUrl.protocol;
    if (publicUrl.port) {
      url.port = publicUrl.port;
    } else {
      // Remove port if public URL doesn't have one
      url.port = '';
    }

    const finalUrl = url.toString();
    console.log('[MinIO] Converted URL:', { internal: internalUrl.substring(0, 100), public: finalUrl.substring(0, 100) });
    return finalUrl;
  } catch (e) {
    console.error('[MinIO] Failed to convert URL:', e);
    return internalUrl;
  }
}
