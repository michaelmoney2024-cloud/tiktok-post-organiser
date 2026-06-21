"use client";

import { useCallback, useState } from "react";
import type { AnalysisResult, MediaPreview } from "@/lib/types";
import { saveToHistory } from "@/lib/history";
import { createThumbnail } from "@/lib/thumbnail";

interface SaveResultButtonProps {
  result: AnalysisResult;
  media: MediaPreview;
}

export function SaveResultButton({ result, media }: SaveResultButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSave = useCallback(async () => {
    if (status === "saved" || status === "saving") return;

    setStatus("saving");

    try {
      const thumbnail = await createThumbnail(media.file, media.type);
      saveToHistory(result, media.type, thumbnail);
      setStatus("saved");
    } catch {
      setStatus("idle");
    }
  }, [result, media, status]);

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={status === "saving" || status === "saved"}
      className={`w-full rounded-xl py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed ${
        status === "saved"
          ? "border border-[#25f4ee]/30 bg-[#25f4ee]/10 text-[#25f4ee]"
          : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
      }`}
    >
      {status === "saving" && "Saving..."}
      {status === "saved" && "Saved to History ✓"}
      {status === "idle" && "Save Result"}
    </button>
  );
}
