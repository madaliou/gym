export const STORAGE_PROVIDERS = ["local", "vercel-blob", "cloudinary", "s3"] as const;

export type StorageProviderName = (typeof STORAGE_PROVIDERS)[number];

export type UploadInput = {
  filename: string;
  contentType: string;
  data: Uint8Array;
};

export type StoredObject = {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
};

export interface StorageProvider {
  readonly name: StorageProviderName;
  upload(input: UploadInput): Promise<StoredObject>;
  delete(pathname: string): Promise<void>;
}
