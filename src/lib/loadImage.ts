export interface LoadedImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  /** Object URL of the original file, for showing it next to the grid. */
  url: string;
}

/** Decode an uploaded file into RGBA pixels (longest side ≤ maxSide). Browser only. */
export async function loadImage(file: File, maxSide = 1200): Promise<LoadedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("unreadable");
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("unreadable");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const { data } = ctx.getImageData(0, 0, width, height);
  return { data, width, height, url: URL.createObjectURL(file) };
}
