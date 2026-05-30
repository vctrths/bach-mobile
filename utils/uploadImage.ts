import { supabase } from "@/utils/supabase";
import type { ImagePickerAsset } from "expo-image-picker";

export const APP_IMAGES_BUCKET = "app-images";
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

type ImageFolder = "profiles" | "gardens" | "logs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function getMimeType(asset: ImagePickerAsset) {
  if (asset.mimeType) return asset.mimeType;

  const extension = asset.uri.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

function getFileExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function validatePickedImage(asset: ImagePickerAsset) {
  const mimeType = getMimeType(asset);

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return "Kies een JPG-, PNG- of WebP-afbeelding.";
  }

  if (asset.fileSize && asset.fileSize > MAX_IMAGE_UPLOAD_BYTES) {
    return "Kies een afbeelding kleiner dan 5 MB.";
  }

  return null;
}

export async function uploadImageAsset({
  asset,
  folder,
  userId,
}: {
  asset: ImagePickerAsset;
  folder: ImageFolder;
  userId: string;
}) {
  const validationError = validatePickedImage(asset);
  if (validationError) {
    throw new Error(validationError);
  }

  const mimeType = getMimeType(asset);
  const extension = getFileExtension(mimeType);
  const path = `${folder}/${userId}/${Date.now()}.${extension}`;
  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Kies een afbeelding kleiner dan 5 MB.");
  }

  const { data, error } = await supabase.storage
    .from(APP_IMAGES_BUCKET)
    .upload(path, arrayBuffer, {
      cacheControl: "3600",
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from(APP_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  };
}
