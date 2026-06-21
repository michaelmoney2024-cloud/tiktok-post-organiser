export interface KeyFrame {
  blob: Blob;
  timestamp: number;
  label: string;
  previewUrl: string;
}

const MAX_FRAME_WIDTH = 512;
const FRAME_FRACTIONS = [
  { fraction: 0.05, label: "Opening" },
  { fraction: 0.25, label: "Early" },
  { fraction: 0.5, label: "Midpoint" },
  { fraction: 0.75, label: "Late" },
  { fraction: 0.92, label: "Closing" },
];

async function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  video.currentTime = time;
  await new Promise<void>((resolve, reject) => {
    video.onseeked = () => resolve();
    video.onerror = () => reject(new Error("Failed to seek video"));
  });
}

function captureFrame(video: HTMLVideoElement): Blob {
  const scale = Math.min(MAX_FRAME_WIDTH / video.videoWidth, 1);
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(video, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  const byteString = atob(dataUrl.split(",")[1]);
  const buffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i);
  }
  return new Blob([buffer], { type: "image/jpeg" });
}

export async function extractVideoKeyframes(file: File): Promise<KeyFrame[]> {
  const url = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video"));
    });

    const duration = video.duration;
    if (!duration || !isFinite(duration)) {
      throw new Error("Could not read video duration");
    }

    const frames: KeyFrame[] = [];

    for (const { fraction, label } of FRAME_FRACTIONS) {
      const timestamp = Math.max(0, Math.min(duration * fraction, duration - 0.1));
      await seekTo(video, timestamp);
      const blob = captureFrame(video);
      frames.push({
        blob,
        timestamp,
        label,
        previewUrl: URL.createObjectURL(blob),
      });
    }

    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function revokeKeyframeUrls(frames: KeyFrame[]): void {
  for (const frame of frames) {
    URL.revokeObjectURL(frame.previewUrl);
  }
}

/** @deprecated Use extractVideoKeyframes for video analysis */
export async function extractVideoFrame(file: File): Promise<Blob> {
  const frames = await extractVideoKeyframes(file);
  return frames[Math.floor(frames.length / 2)].blob;
}
