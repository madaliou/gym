export const MEMBER_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const MEMBER_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/*";

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function memberPhotoClientError(file: File) {
  if (!allowedTypes.has(file.type)) {
    return "La photo doit être au format JPG, PNG ou WebP.";
  }

  if (file.size > MEMBER_PHOTO_MAX_BYTES) {
    return "La photo ne doit pas dépasser 5 Mo.";
  }

  return null;
}
