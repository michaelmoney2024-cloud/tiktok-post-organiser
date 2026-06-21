"use client";

import { useCallback, useState } from "react";
import type { AnalysisResult, UploadMediaType } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import {
  getPostInstructions,
  getTikTokStoreUrl,
  openTikTokApp,
  postToTikTok,
  type PostToTikTokResult,
} from "@/lib/tiktok-share";

interface PostOnTikTokPanelProps {
  result: AnalysisResult;
  mediaFile?: File;
  enhancedMediaUrl?: string | null;
  mediaType?: UploadMediaType;
}

export function PostOnTikTokPanel({
  result,
  mediaFile,
  enhancedMediaUrl,
  mediaType = "image",
}: PostOnTikTokPanelProps) {
  const { finalPost, mediaEnhancement } = result;
  const [isPosting, setIsPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postResult, setPostResult] = useState<PostToTikTokResult | null>(null);

  const handlePostOnTikTok = useCallback(async () => {
    if (!finalPost || !mediaFile) return;

    setIsPosting(true);
    setShowModal(true);

    try {
      const outcome = await postToTikTok({
        caption: finalPost.postOnTikTok,
        mediaFile,
        enhancedMediaUrl,
        mediaType,
      });
      setPostResult(outcome);
    } catch {
      setPostResult({
        captionCopied: false,
        sharedViaNativeSheet: false,
        openedTikTok: false,
      });
    } finally {
      setIsPosting(false);
    }
  }, [finalPost, mediaFile, enhancedMediaUrl, mediaType]);

  if (!finalPost) return null;

  const instructions = postResult ? getPostInstructions(postResult) : [];

  return (
    <>
      <section className="rounded-2xl border-2 border-[#fe2c55]/40 bg-gradient-to-br from-[#fe2c55]/15 via-[#fe2c55]/5 to-transparent p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fe2c55] to-[#ff0050] text-lg font-bold text-white shadow-lg shadow-[#fe2c55]/30">
              +
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">+ Create · Post On TikTok</h2>
              <p className="text-xs text-white/50">Best caption selected &amp; optimized for posting</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              text={finalPost.postOnTikTok}
              label="Copy post"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            />
            {mediaFile && (
              <button
                type="button"
                onClick={handlePostOnTikTok}
                disabled={isPosting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#fe2c55] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-[#fe2c55]/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TikTokIcon />
                {isPosting ? "Opening TikTok…" : "Post On TikTok"}
              </button>
            )}
          </div>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md animate-fade-in rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fe2c55]/20">
                <TikTokIcon className="h-6 w-6 text-[#fe2c55]" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isPosting ? "Preparing your post…" : "Ready to post on TikTok"}
                </h3>
                <p className="text-xs text-white/50">
                  Caption copied · Opening TikTok
                </p>
              </div>
            </div>

            {isPosting ? (
              <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#25f4ee] border-t-transparent" />
                <p className="text-sm text-white/70">Sharing your content with TikTok…</p>
              </div>
            ) : (
              <ol className="space-y-3">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/80">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25f4ee]/20 text-xs font-bold text-[#25f4ee]">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => openTikTokApp()}
                className="flex-1 rounded-xl bg-[#fe2c55] py-3 text-sm font-bold text-white hover:brightness-110"
              >
                Open TikTok App
              </button>
              <a
                href={getTikTokStoreUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-white/70 hover:bg-white/10"
              >
                Get TikTok
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-3 w-full py-2 text-xs text-white/40 hover:text-white/60"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}
