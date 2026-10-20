import "server-only";
import { randomUUID } from "node:crypto";
import {
  deleteStoredFile,
  PhotoStorageError,
  readValidatedMemberPhoto,
  storedPathFromPublicUrl,
} from "@/lib/storage/local-folder";
import { deleteBlobPhoto, hasBlobStore, saveMemberPhotoToBlob } from "@/lib/storage/vercel-blob";

export { PhotoStorageError, storedPathFromPublicUrl };

const mimeByExtension = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export type PersistedMemberPhoto = {
  photoUrl: string | null;
  storedPathname: string | null;
  photoData: Uint8Array | null;
  photoMime: string | null;
};

function isPhotoFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

export async function persistMemberPhoto(
  photo: FormDataEntryValue | null,
): Promise<PersistedMemberPhoto> {
  if (!isPhotoFile(photo)) {
    return { photoUrl: null, storedPathname: null, photoData: null, photoMime: null };
  }

  const { bytes, extension } = await readValidatedMemberPhoto(photo);
  const photoMime = mimeByExtension[extension];

  if (hasBlobStore()) {
    try {
      const saved = await saveMemberPhotoToBlob(bytes, extension, `${randomUUID()}.${extension}`);
      return { photoUrl: saved.url, storedPathname: saved.pathname, photoData: null, photoMime: null };
    } catch (error) {
      console.error("blob photo upload failed, storing in database", error);
    }
  }

  return {
    photoUrl: null,
    storedPathname: null,
    photoData: bytes,
    photoMime,
  };
}

export async function removeStoredPhoto(pathname: string | null) {
  if (!pathname || pathname.startsWith("/api/members/")) {
    return;
  }

  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    await deleteBlobPhoto(pathname);
    return;
  }

  await deleteStoredFile(pathname);
}
