"use client";

import { AppLogo } from "./AppLogo";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Analyzing your content..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/70 backdrop-blur-sm">
      <div className="relative animate-pulse">
        <AppLogo href="" className="opacity-90" />
        <div className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-[#fe2c55]" />
      </div>
      <p className="text-sm font-medium text-white/90">{message}</p>
      <p className="text-xs text-white/50">AI is crafting your TikTok content</p>
    </div>
  );
}
