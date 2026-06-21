"use client";

interface EnhancedMediaPreviewProps {
  originalUrl: string;
  enhancedUrl?: string | null;
  mediaType: "image" | "video";
}

export function EnhancedMediaPreview({
  originalUrl,
  enhancedUrl,
  mediaType,
}: EnhancedMediaPreviewProps) {
  if (mediaType === "video") {
    return (
      <section className="rounded-xl border border-[#25f4ee]/20 bg-[#25f4ee]/5 p-4">
        <h3 className="mb-2 text-sm font-semibold text-white">Video ready for TikTok</h3>
        <p className="text-xs text-white/50">
          Your video has been analyzed. Follow the media optimization tips below before posting.
        </p>
        <video
          src={originalUrl}
          controls
          className="mt-3 max-h-48 w-full rounded-lg object-contain"
        />
      </section>
    );
  }

  if (!enhancedUrl) return null;

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Enhanced for TikTok</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            Original
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt="Original"
            className="max-h-48 w-full rounded-lg object-contain"
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#25f4ee]">
            Enhanced
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enhancedUrl}
            alt="Enhanced for TikTok"
            className="max-h-48 w-full rounded-lg object-contain ring-2 ring-[#25f4ee]/30"
          />
        </div>
      </div>
    </section>
  );
}
