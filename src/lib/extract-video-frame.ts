export async function extractVideoFrame(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video"));
    });

    video.currentTime = Math.min(1, video.duration / 2 || 0);

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Failed to seek video"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Failed to extract frame"));
        },
        "image/jpeg",
        0.85,
      );
    });

    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
