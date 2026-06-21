import type { UploadMediaType } from "./types";

const MAX_SIZE = 200;

export async function createThumbnail(
  file: File,
  type: UploadMediaType,
): Promise<string> {
  if (type === "image") {
    return createImageThumbnail(file);
  }
  return createVideoThumbnail(file);
}

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): string {
  const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

function createImageThumbnail(file: File): Promise<string> {
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        resolve(drawToCanvas(img, img.naturalWidth, img.naturalHeight));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function createVideoThumbnail(file: File): Promise<string> {
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 2 || 0);
    };

    video.onseeked = () => {
      try {
        resolve(drawToCanvas(video, video.videoWidth, video.videoHeight));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    };
  });
}
