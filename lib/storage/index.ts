import "server-only";
import { deleteStoredFile, saveMemberPhoto } from "@/lib/storage/local-folder";
import type { StorageProvider, UploadInput } from "@/lib/storage/types";

const localFolderStorage: StorageProvider = {
  name: "local",
  async upload(input: UploadInput) {
    const file = new File([Buffer.from(input.data)], input.filename, {
      type: input.contentType,
    });
    const saved = await saveMemberPhoto(file);

    return {
      url: saved.url,
      pathname: saved.pathname,
      contentType: input.contentType,
      size: input.data.byteLength,
    };
  },
  async delete(pathname: string) {
    await deleteStoredFile(pathname);
  },
};

export function getStorageProvider(): StorageProvider {
  return localFolderStorage;
}
