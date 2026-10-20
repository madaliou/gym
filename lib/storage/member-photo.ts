import "server-only";
import { randomUUID } from "node:crypto";
import {
  deleteStoredFile,
  isUnwritableFilesystem,
  PhotoStorageError,
  readValidatedMemberPhoto,
  saveMemberPhoto,
  storedPathFromPublicUrl,
} from "@/lib/storage/local-folder";
import { deleteBlobPhoto, hasBlobStore, saveMemberPhotoToBlob } from "@/lib/storage/vercel-blob";

export { PhotoStorageError, storedPathFromPublicUrl };

const photoSkippedWarning =
  "La fiche a été enregistrée, mais la photo n'a pas pu être stockée sur l'hébergement actuel. Ajoutez un store Vercel Blob pour conserver les photos en ligne.";

export type PersistedMemberPhoto = {
  photoUrl: string | null;
  storedPathname: string | null;
  warning?: string;
};

function isPhotoFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

export async function persistMemberPhoto(
  photo: FormDataEntryValue | null,
): Promise<PersistedMemberPhoto> {
  if (!isPhotoFile(photo)) {
    return { photoUrl: null, storedPathname: null };
  }

  const { bytes, extension } = await readValidatedMemberPhoto(photo);
  const filename = `${randomUUID()}.${extension}`;

  if (hasBlobStore()) {
    try {
      const saved = await saveMemberPhotoToBlob(bytes, extension, filename);
      return { photoUrl: saved.url, storedPathname: saved.pathname };
    } catch (error) {
      console.error("blob photo upload failed", error);
      return { photoUrl: null, storedPathname: null, warning: photoSkippedWarning };
    }
  }

  if (process.env.VERCEL) {
    return { photoUrl: null, storedPathname: null, warning: photoSkippedWarning };
  }

  try {
    const saved = await saveMemberPhoto(photo);
    return { photoUrl: saved.url, storedPathname: saved.pathname };
  } catch (error) {
    if (error instanceof PhotoStorageError || (error instanceof Error && error.name === "PhotoStorageError")) {
      throw error;
    }

    if (isUnwritableFilesystem(error)) {
      return { photoUrl: null, storedPathname: null, warning: photoSkippedWarning };
    }

    throw error;
  }
}

export async function removeStoredPhoto(pathname: string | null) {
  if (!pathname) {
    return;
  }

  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    await deleteBlobPhoto(pathname);
    return;
  }

  await deleteStoredFile(pathname);
}
