"use client";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Analyzing your content..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/70 backdrop-blur-sm">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-white/20 border-t-[#fe2c55]" />
        <div
          className="absolute inset-2 animate-spin rounded-full border-[3px] border-white/10 border-b-[#25f4ee]"
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        />
      </div>
      <p className="text-sm font-medium text-white/90">{message}</p>
      <p className="text-xs text-white/50">AI is crafting your TikTok content</p>
    </div>
  );
}
