import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { MEMBER_PHOTO_MAX_BYTES } from "./image-rules";

export type SavedImage = {
  url: string;
  pathname: string;
};

function uploadsRoot() {
  const configured = process.env.UPLOADS_DIR ?? path.join("public", "uploads");
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

function detectImageExtension(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

export async function saveMemberPhoto(file: File): Promise<SavedImage> {
  if (file.size === 0 || file.size > MEMBER_PHOTO_MAX_BYTES) {
    throw new PhotoStorageError("La photo ne doit pas dépasser 5 Mo.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = detectImageExtension(bytes);

  if (!extension) {
    throw new PhotoStorageError("La photo doit être au format JPG, PNG ou WebP.");
  }

  const directory = path.join(uploadsRoot(), "members");
  const filename = `${randomUUID()}.${extension}`;
  const pathname = path.join(directory, filename);

  await mkdir(directory, { recursive: true });
  await writeFile(pathname, bytes);

  const publicDir = path.resolve(process.cwd(), "public");
  const relative = path.relative(publicDir, pathname);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    await unlink(pathname).catch(() => undefined);
    throw new PhotoStorageError("Le dossier des photos doit se trouver dans public/uploads.");
  }

  return {
    url: `/${relative.split(path.sep).join("/")}`,
    pathname,
  };
}

export function storedPathFromPublicUrl(url: string | null) {
  if (!url || !url.startsWith("/uploads/")) {
    return null;
  }

  return path.join(
    /* turbopackIgnore: true */ uploadsRoot(),
    ...url.replace(/^\/uploads\//, "").split("/"),
  );
}

export async function deleteStoredFile(pathname: string) {
  const root = uploadsRoot();
  const target = path.resolve(/* turbopackIgnore: true */ pathname);

  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    return;
  }

  await unlink(target).catch(() => undefined);
}

export class PhotoStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoStorageError";
  }
}
