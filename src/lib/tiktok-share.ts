export type PostToTikTokResult = {
  captionCopied: boolean;
  sharedViaNativeSheet: boolean;
  openedTikTok: boolean;
};

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

async function dataUrlToFile(dataUrl: string, filename: string, mimeType: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType || blob.type });
}

async function resolveMediaFile(
  mediaFile: File,
  enhancedMediaUrl?: string | null,
  mediaType?: "image" | "video",
): Promise<File> {
  if (mediaType === "image" && enhancedMediaUrl?.startsWith("data:")) {
    try {
      return await dataUrlToFile(enhancedMediaUrl, "tiktok-post.jpg", "image/jpeg");
    } catch {
      return mediaFile;
    }
  }
  return mediaFile;
}

export async function copyCaption(caption: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(caption);
    return true;
  } catch {
    return false;
  }
}

export function openTikTokApp(): void {
  if (isIOS()) {
    window.location.href = "snssdk1233://aweme/create/";
    return;
  }

  if (isAndroid()) {
    window.location.href =
      "intent://www.tiktok.com/#Intent;scheme=snssdk1233;package=com.zhiliaoapp.musically;end";
    return;
  }

  window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
}

export function getTikTokStoreUrl(): string {
  if (isIOS()) {
    return "https://apps.apple.com/app/tiktok/id835599320";
  }
  if (isAndroid()) {
    return "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically";
  }
  return "https://www.tiktok.com/download";
}

export async function postToTikTok(options: {
  caption: string;
  mediaFile: File;
  enhancedMediaUrl?: string | null;
  mediaType: "image" | "video";
}): Promise<PostToTikTokResult> {
  const { caption, mediaFile, enhancedMediaUrl, mediaType } = options;
  const captionCopied = await copyCaption(caption);
  const file = await resolveMediaFile(mediaFile, enhancedMediaUrl, mediaType);

  let sharedViaNativeSheet = false;

  if (typeof navigator.share === "function") {
    try {
      const shareData: ShareData = { text: caption, title: "Post on TikTok" };
      if (navigator.canShare?.({ files: [file] })) {
        shareData.files = [file];
      }

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        sharedViaNativeSheet = true;
      }
    } catch {
      // User cancelled share sheet or share unavailable
    }
  }

  if (!sharedViaNativeSheet) {
    openTikTokApp();

    if (isMobileDevice()) {
      window.setTimeout(() => {
        window.open(getTikTokStoreUrl(), "_blank", "noopener,noreferrer");
      }, 2500);
    }
  }

  return {
    captionCopied,
    sharedViaNativeSheet,
    openedTikTok: !sharedViaNativeSheet,
  };
}

export function getPostInstructions(result: PostToTikTokResult): string[] {
  if (result.sharedViaNativeSheet) {
    return [
      "Caption copied to your clipboard.",
      "Choose TikTok from the share menu.",
      "Your media and caption will be ready — tap Post in TikTok.",
    ];
  }

  if (isMobileDevice()) {
    return [
      "Caption copied — paste it in TikTok.",
      "Opening TikTok app now…",
      "Select your photo or video if needed.",
      "Paste the caption and tap Post.",
    ];
  }

  return [
    "Caption copied to your clipboard.",
    "TikTok upload opened in a new tab.",
    "Upload your media, paste the caption, and click Post.",
  ];
}
