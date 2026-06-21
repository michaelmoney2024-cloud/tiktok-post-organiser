"use client";

import { useCallback, useEffect, useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VideoStrategyDashboard } from "@/components/VideoStrategyDashboard";
import { AudienceTargetingPanel } from "@/components/AudienceTargetingPanel";
import { AppNav } from "@/components/AppNav";
import { SaveResultButton } from "@/components/SaveResultButton";
import {
  extractVideoKeyframes,
  revokeKeyframeUrls,
  type KeyFrame,
} from "@/lib/extract-video-keyframes";
import type {
  AgeGroup,
  AnalysisResult,
  Country,
  Language,
  MediaPreview,
  Niche,
} from "@/lib/types";

export default function Home() {
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [country, setCountry] = useState<Country>("USA");
  const [language, setLanguage] = useState<Language>("English");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("All Ages");
  const [niche, setNiche] = useState<Niche>("Lifestyle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your content...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (keyFrames.length > 0) revokeKeyframeUrls(keyFrames);
    };
  }, [keyFrames]);

  const handleMediaSelect = useCallback((preview: MediaPreview) => {
    setMedia(preview);
    setResult(null);
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
    setError(null);
  }, [media]);

  const handleAnalyze = useCallback(async () => {
    if (!media) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

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
        formData.append("language", language);
        formData.append("ageGroup", ageGroup);
        formData.append("niche", niche);

        const response = await fetch("/api/analyze-video", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Video analysis failed");
        }
        setResult(data as AnalysisResult);
      } else {
        setLoadingMessage("Analyzing your content...");
        const formData = new FormData();
        formData.append("file", media.file);
        formData.append("mediaType", media.type);
        formData.append("country", country);
        formData.append("language", language);
        formData.append("ageGroup", ageGroup);
        formData.append("niche", niche);

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Analysis failed");
        }
        setResult(data as AnalysisResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
      setLoadingMessage("Analyzing your content...");
    }
  }, [media, country, language, ageGroup, niche]);

  const isVideoResult = result?.isVideoStrategy;

  return (
    <div className="min-h-full bg-[#0f0f0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#fe2c55]/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#25f4ee]/15 blur-[100px]" />
      </div>

      <div
        className={`relative mx-auto px-4 py-8 sm:px-6 sm:py-12 ${
          isVideoResult ? "max-w-4xl" : "max-w-lg sm:max-w-xl"
        }`}
      >
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25f4ee]" />
            Powered by AI
          </div>
          <h1 className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            TikTok Post Organizer
          </h1>
          <p className="mt-2 text-sm text-white/50 sm:text-base">
            Upload images or videos — get hooks, captions, hashtags &amp; full content strategy
          </p>
        </header>

        <AppNav />

        <main className="space-y-6">
          <AudienceTargetingPanel
            country={country}
            language={language}
            ageGroup={ageGroup}
            niche={niche}
            onCountryChange={setCountry}
            onLanguageChange={setLanguage}
            onAgeGroupChange={setAgeGroup}
            onNicheChange={setNiche}
            disabled={isAnalyzing}
          />

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
                <VideoStrategyDashboard result={result} keyFrames={keyFrames} />
              ) : (
                <ResultsPanel result={result} />
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

        <footer className="mt-12 text-center text-xs text-white/30">
          Supports images &amp; videos · Max 20MB · Advanced multi-frame video analysis
        </footer>
      </div>
    </div>
  );
}
