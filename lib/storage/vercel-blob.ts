import "server-only";
import { del, put } from "@vercel/blob";
import type { SavedImage } from "@/lib/storage/local-folder";

const contentTypes = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function saveMemberPhotoToBlob(
  bytes: Uint8Array,
  extension: keyof typeof contentTypes,
  filename: string,
): Promise<SavedImage> {
  const blob = await put(`members/${filename}`, Buffer.from(bytes), {
    access: "public",
    addRandomSuffix: false,
    contentType: contentTypes[extension],
  });

  return {
    url: blob.url,
    pathname: blob.url,
  };
}

export async function deleteBlobPhoto(url: string) {
  await del(url).catch(() => undefined);
}
