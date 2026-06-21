"use client";

import { useCallback, useEffect, useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VideoStrategyDashboard } from "@/components/VideoStrategyDashboard";
import { CountrySelect } from "@/components/CountrySelect";
import { NicheSelect } from "@/components/NicheSelect";
import { AppNav } from "@/components/AppNav";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { SaveResultButton } from "@/components/SaveResultButton";
import {
  extractVideoKeyframes,
  revokeKeyframeUrls,
  type KeyFrame,
} from "@/lib/extract-video-keyframes";
import {
  enhanceImageForTikTok,
  IMAGE_ENHANCEMENT_APPLIED,
  VIDEO_ENHANCEMENT_TIPS,
} from "@/lib/enhance-media";
import type { AnalysisResult, Country, MediaPreview, Niche } from "@/lib/types";

async function finalizeForTikTok(
  data: AnalysisResult,
  mediaType: "image" | "video",
  file: File,
): Promise<{ result: AnalysisResult; enhancedMediaUrl: string | null }> {
  const finalizeRes = await fetch("/api/finalize-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      viralHook: data.viralHook,
      captions: data.captions,
      hashtags: data.hashtags,
      country: data.country,
      niche: data.niche,
      mediaType,
    }),
  });

  const finalized = await finalizeRes.json();
  if (!finalizeRes.ok) {
    throw new Error(finalized.error || "Failed to optimize for TikTok");
  }

  let enhancedMediaUrl: string | null = null;
  let applied: string[] = [];

  if (mediaType === "image") {
    try {
      enhancedMediaUrl = await enhanceImageForTikTok(file);
      applied = IMAGE_ENHANCEMENT_APPLIED;
    } catch {
      // Image enhancement is best-effort
    }
  }

  const apiTips = (finalized.mediaEnhancement?.tips as string[] | undefined) ?? [];
  const tips =
    mediaType === "video"
      ? [...new Set([...apiTips, ...VIDEO_ENHANCEMENT_TIPS])]
      : apiTips;

  return {
    result: {
      ...data,
      finalPost: finalized.finalPost,
      mediaEnhancement: { tips, applied },
    },
    enhancedMediaUrl,
  };
}

export default function Home() {
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [country, setCountry] = useState<Country>("United States");
  const [niche, setNiche] = useState<Niche>("Lifestyle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your content...");
  const [error, setError] = useState<string | null>(null);
  const [enhancedMediaUrl, setEnhancedMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (keyFrames.length > 0) revokeKeyframeUrls(keyFrames);
    };
  }, [keyFrames]);

  const handleMediaSelect = useCallback((preview: MediaPreview) => {
    setMedia(preview);
    setResult(null);
    setEnhancedMediaUrl(null);
    setError(null);
    setKeyFrames((prev) => {
      if (prev.length > 0) revokeKeyframeUrls(prev);
      return [];
    });
  }, []);

  const handleClear = useCallback(() => {
    if (media?.previewUrl) URL.revokeObjectURL(media.previewUrl);
    setKeyFrames((prev) => {
      if (prev.length > 0) revokeKeyframeUrls(prev);
      return [];
    });
    setMedia(null);
    setResult(null);
    setEnhancedMediaUrl(null);
    setError(null);
  }, [media]);

  const handleAnalyze = useCallback(async () => {
    if (!media) return;

    if (!niche.trim() || niche.trim().length < 2) {
      setError("Please enter a content niche (at least 2 characters)");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setEnhancedMediaUrl(null);

    try {
      if (media.type === "video") {
        setLoadingMessage("Extracting key frames...");
        const frames = await extractVideoKeyframes(media.file);
        setKeyFrames((prev) => {
          if (prev.length > 0) revokeKeyframeUrls(prev);
          return frames;
        });

        setLoadingMessage("Analyzing video & building strategy...");
        const formData = new FormData();
        for (const frame of frames) {
          formData.append("frames", new File([frame.blob], `${frame.label}.jpg`, { type: "image/jpeg" }));
        }
        formData.append("frameLabels", JSON.stringify(frames.map((f) => f.label)));
        formData.append("country", country);
        formData.append("niche", niche);

        const response = await fetch("/api/analyze-video", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Video analysis failed");
        }

        setLoadingMessage("Ranking captions & optimizing for TikTok...");
        const { result: optimized, enhancedMediaUrl: enhanced } = await finalizeForTikTok(
          data as AnalysisResult,
          "video",
          media.file,
        );
        setEnhancedMediaUrl(enhanced);
        setResult(optimized);
      } else {
        setLoadingMessage("Analyzing your content...");
        const formData = new FormData();
        formData.append("file", media.file);
        formData.append("mediaType", media.type);
        formData.append("country", country);
        formData.append("niche", niche);

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Analysis failed");
        }

        setLoadingMessage("Ranking captions & optimizing for TikTok...");
        const { result: optimized, enhancedMediaUrl: enhanced } = await finalizeForTikTok(
          data as AnalysisResult,
          "image",
          media.file,
        );
        setEnhancedMediaUrl(enhanced);
        setResult(optimized);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
      setLoadingMessage("Analyzing your content...");
    }
  }, [media, country, niche]);

  const isVideoResult = result?.isVideoStrategy;

  return (
    <div className="min-h-full bg-[#0f0f0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#fe2c55]/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#25f4ee]/15 blur-[100px]" />
      </div>

      <div
        className={`relative mx-auto px-4 py-8 sm:px-6 sm:py-12 ${
          isVideoResult || result?.finalPost ? "max-w-4xl" : "max-w-lg sm:max-w-xl"
        }`}
      >
        <AppHeader
          badge="Powered by AI"
          subtitle="Upload images or videos — get hooks, captions, hashtags & full content strategy"
        />

        <AppNav />

        <main className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <CountrySelect value={country} onChange={setCountry} disabled={isAnalyzing} />
            <NicheSelect value={niche} onChange={setNiche} disabled={isAnalyzing} />
          </div>

          <section className="relative">
            <UploadZone
              media={media}
              onMediaSelect={handleMediaSelect}
              onClear={handleClear}
              disabled={isAnalyzing}
            />
            {isAnalyzing && <LoadingOverlay message={loadingMessage} />}
          </section>

          {media && !result && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-4 text-base font-semibold text-white shadow-lg shadow-[#fe2c55]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing
                ? "Analyzing..."
                : media.type === "video"
                  ? "Analyze Video & Build Strategy"
                  : "Generate TikTok Content"}
            </button>
          )}

          {media?.type === "video" && !result && !isAnalyzing && (
            <p className="text-center text-xs text-white/40">
              Videos are analyzed across 5 key frames for a complete content strategy
            </p>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {result && media && (
            <>
              {result.isVideoStrategy ? (
                <VideoStrategyDashboard
                  result={result}
                  keyFrames={keyFrames}
                  mediaPreviewUrl={media.previewUrl}
                  enhancedMediaUrl={enhancedMediaUrl}
                  mediaType={media.type}
                  mediaFile={media.file}
                />
              ) : (
                <ResultsPanel
                  result={result}
                  mediaPreviewUrl={media.previewUrl}
                  enhancedMediaUrl={enhancedMediaUrl}
                  mediaType={media.type}
                  mediaFile={media.file}
                />
              )}
              <SaveResultButton result={result} media={media} />
              <button
                type="button"
                onClick={handleClear}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Upload new content
              </button>
            </>
          )}
        </main>

        <AppFooter note="Supports images & videos · Max 20MB · Advanced multi-frame video analysis" />
      </div>
    </div>
  );
}
