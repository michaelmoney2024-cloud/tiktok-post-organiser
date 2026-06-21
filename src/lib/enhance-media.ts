export async function enhanceImageForTikTok(file: File): Promise<string> {
  const url = URL.createObjectURL(file);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.filter = "contrast(1.08) saturate(1.12) brightness(1.03)";
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    sharpen(imageData, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

function sharpen(data: ImageData, width: number, height: number): void {
  const src = new Uint8ClampedArray(data.data);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += src[idx] * kernel[ki++];
          }
        }
        const outIdx = (y * width + x) * 4 + c;
        data.data[outIdx] = Math.min(255, Math.max(0, sum));
      }
    }
  }
}

export const IMAGE_ENHANCEMENT_APPLIED = [
  "Boosted contrast for mobile screens",
  "Enhanced color saturation",
  "Applied sharpening for crisp detail",
  "Optimized brightness for TikTok feed",
];

export const VIDEO_ENHANCEMENT_TIPS = [
  "Export in 1080×1920 (9:16) at 30fps minimum",
  "Ensure the first frame is visually striking — it's your thumbnail",
  "Use bright, even lighting on your subject",
  "Keep the subject centered in the safe zone",
  "Add bold text overlay in the first 2 seconds",
];
