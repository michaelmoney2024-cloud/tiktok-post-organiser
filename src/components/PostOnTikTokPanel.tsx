"use client";

import type { AnalysisResult } from "@/lib/types";
import { CopyButton } from "./CopyButton";

interface PostOnTikTokPanelProps {
  result: AnalysisResult;
}

export function PostOnTikTokPanel({ result }: PostOnTikTokPanelProps) {
  const { finalPost, mediaEnhancement } = result;
  if (!finalPost) return null;

  return (
    <section className="rounded-2xl border-2 border-[#fe2c55]/40 bg-gradient-to-br from-[#fe2c55]/15 via-[#fe2c55]/5 to-transparent p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fe2c55] to-[#ff0050] text-lg font-bold text-white shadow-lg shadow-[#fe2c55]/30">
            +
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">+ Create · Post On TikTok</h2>
            <p className="text-xs text-white/50">Best caption selected &amp; optimized for posting</p>
          </div>
        </div>
        <CopyButton
          text={finalPost.postOnTikTok}
          label="Copy post"
          className="rounded-xl bg-[#fe2c55] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        />
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
          {finalPost.postOnTikTok}
        </p>
      </div>

      {finalPost.cleanupNotes.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {finalPost.cleanupNotes.map((note, i) => (
            <span
              key={i}
              className="rounded-full bg-[#25f4ee]/10 px-3 py-1 text-[10px] font-medium text-[#25f4ee]"
            >
              ✓ {note}
            </span>
          ))}
        </div>
      )}

      <details className="group">
        <summary className="cursor-pointer text-xs font-medium text-white/50 hover:text-white/70">
          View caption rankings ({finalPost.rankedCaptions.length} analyzed)
        </summary>
        <ol className="mt-3 space-y-2">
          {finalPost.rankedCaptions.map((cap, rank) => (
            <li
              key={cap.index}
              className={`rounded-lg border p-3 ${
                cap.index === finalPost.selectedCaptionIndex
                  ? "border-[#fe2c55]/40 bg-[#fe2c55]/10"
                  : "border-white/5 bg-black/20"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-[#25f4ee]">
                  #{rank + 1} · Score {cap.engagementScore}
                  {cap.index === finalPost.selectedCaptionIndex && (
                    <span className="ml-2 text-[#fe2c55]">★ Selected</span>
                  )}
                </span>
                <CopyButton
                  text={cap.text}
                  label="Copy"
                  className="bg-white/10 text-white/70 hover:bg-white/15"
                />
              </div>
              <p className="text-sm text-white/80">{cap.text}</p>
              <p className="mt-1 text-xs text-white/40">{cap.reason}</p>
            </li>
          ))}
        </ol>
      </details>

      {mediaEnhancement && mediaEnhancement.tips.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Media optimization
          </h3>
          {mediaEnhancement.applied.length > 0 && (
            <ul className="mb-2 space-y-1">
              {mediaEnhancement.applied.map((a, i) => (
                <li key={i} className="text-xs text-[#25f4ee]">✓ {a}</li>
              ))}
            </ul>
          )}
          <ul className="space-y-1">
            {mediaEnhancement.tips.map((tip, i) => (
              <li key={i} className="text-xs text-white/60">→ {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
