import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin } from "payload";

/**
 * NFR-SEC-06 / ADR-004 object storage. With S3_BUCKET set (any S3-compatible
 * service: AWS, Cloudflare R2, …) media go to that bucket; CVs go to
 * S3_PRIVATE_BUCKET, never public, served through 5-minute signed URLs after
 * Payload's access check. Without S3_BUCKET files stay on local disk (development).
 */
export function s3Config() {
  if (!process.env.S3_BUCKET) return null;
  return {
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  };
}

export function storagePlugins(): Plugin[] {
  const config = s3Config();
  if (!config) return [];
  const plugins = [
    s3Storage({
      bucket: process.env.S3_BUCKET!,
      config,
      collections: { media: { prefix: "media" }, avatars: { prefix: "avatars" } },
    }),
  ];
  plugins.push(
    s3Storage({
      bucket: process.env.S3_PRIVATE_BUCKET || process.env.S3_BUCKET!,
      config,
      acl: "private",
      collections: {
        "private-files": { prefix: "private", signedDownloads: { expiresIn: 300 } },
      },
    }),
  );
  return plugins;
}

/** Read a stored CV back (virus scan): from the private bucket or the local disk. */
export async function readPrivateFile(filename: string): Promise<Buffer> {
  const config = s3Config();
  if (!config) {
    const [{ readFile }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    return readFile(path.resolve(".data/private", filename));
  }
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client(config);
  const res = await client.send(
    new GetObjectCommand({
      Bucket: process.env.S3_PRIVATE_BUCKET || process.env.S3_BUCKET!,
      Key: `private/${filename}`,
    }),
  );
  return Buffer.from(await res.Body!.transformToByteArray());
}
