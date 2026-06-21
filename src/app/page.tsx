"use client";

import { useCallback, useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ResultsPanel } from "@/components/ResultsPanel";
import { CountrySelect } from "@/components/CountrySelect";
import { NicheSelect } from "@/components/NicheSelect";
import { AppNav } from "@/components/AppNav";
import { SaveResultButton } from "@/components/SaveResultButton";
import { extractVideoFrame } from "@/lib/extract-video-frame";
import type { AnalysisResult, Country, MediaPreview, Niche } from "@/lib/types";

export default function Home() {
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [country, setCountry] = useState<Country>("USA");
  const [niche, setNiche] = useState<Niche>("Lifestyle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaSelect = useCallback((preview: MediaPreview) => {
    setMedia(preview);
    setResult(null);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    if (media?.previewUrl) URL.revokeObjectURL(media.previewUrl);
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
      let fileToSend: File | Blob = media.file;

      if (media.type === "video") {
        const frameBlob = await extractVideoFrame(media.file);
        fileToSend = new File([frameBlob], "frame.jpg", { type: "image/jpeg" });
      }

      const formData = new FormData();
      formData.append("file", fileToSend);
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

      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  }, [media, country, niche]);

  return (
    <div className="min-h-full bg-[#0f0f0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#fe2c55]/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#25f4ee]/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-8 sm:max-w-xl sm:px-6 sm:py-12">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25f4ee] animate-pulse" />
            Powered by AI
          </div>
          <h1 className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            TikTok Post Organizer
          </h1>
          <p className="mt-2 text-sm text-white/50 sm:text-base">
            Upload your content and get viral hooks, captions, hashtags &amp; ideas
          </p>
        </header>

        <AppNav />

        <main className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <CountrySelect
              value={country}
              onChange={setCountry}
              disabled={isAnalyzing}
            />
            <NicheSelect
              value={niche}
              onChange={setNiche}
              disabled={isAnalyzing}
            />
          </div>

          <section className="relative">
            <UploadZone
              media={media}
              onMediaSelect={handleMediaSelect}
              onClear={handleClear}
              disabled={isAnalyzing}
            />
            {isAnalyzing && <LoadingOverlay />}
          </section>

          {media && !result && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-4 text-base font-semibold text-white shadow-lg shadow-[#fe2c55]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "Generate TikTok Content"}
            </button>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {result && media && (
            <>
              <ResultsPanel result={result} />
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
          Supports images &amp; videos · Max 20MB
        </footer>
      </div>
    </div>
  );
}
