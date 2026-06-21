"use client";

import { useCallback, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { UploadZone } from "@/components/UploadZone";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AudienceTargetingPanel } from "@/components/AudienceTargetingPanel";
import { CopyButton } from "@/components/CopyButton";
import type {
  AgeGroup,
  Country,
  Language,
  MediaPreview,
  Niche,
  StudioResult,
} from "@/lib/types";

const PLATFORMS = [
  { key: "tiktokCaption" as const, label: "TikTok", emoji: "🎵" },
  { key: "instagramCaption" as const, label: "Instagram", emoji: "📸" },
  { key: "youtubeShortsTitle" as const, label: "YouTube Shorts Title", emoji: "▶️" },
  { key: "youtubeDescription" as const, label: "YouTube Description", emoji: "📝" },
  { key: "twitterPost" as const, label: "X / Twitter", emoji: "𝕏" },
  { key: "facebookPost" as const, label: "Facebook", emoji: "👤" },
  { key: "linkedinPost" as const, label: "LinkedIn", emoji: "💼" },
];

export default function StudioPage() {
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [country, setCountry] = useState<Country>("USA");
  const [language, setLanguage] = useState<Language>("English");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("All Ages");
  const [niche, setNiche] = useState<Niche>("Lifestyle");
  const [result, setResult] = useState<StudioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!media) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", media.file);
      formData.append("country", country);
      formData.append("language", language);
      formData.append("ageGroup", ageGroup);
      formData.append("niche", niche);

      const res = await fetch("/api/studio", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data as StudioResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [media, country, language, ageGroup, niche]);

  const allContent = result
    ? PLATFORMS.map((p) => `=== ${p.label} ===\n${result[p.key]}`).join("\n\n")
    : "";

  return (
    <PageLayout
      title="AI Content Studio"
      subtitle="One upload → content for TikTok, Instagram, YouTube, X, Facebook & LinkedIn"
      badge="Multi-platform"
      wide
    >
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
          disabled={loading}
        />

        <section className="relative">
          <UploadZone
            media={media}
            onMediaSelect={(m) => { setMedia(m); setResult(null); setError(null); }}
            onClear={() => { if (media?.previewUrl) URL.revokeObjectURL(media.previewUrl); setMedia(null); setResult(null); }}
            disabled={loading}
          />
          {loading && <LoadingOverlay message="Generating platform content..." />}
        </section>

        {media && !result && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-4 text-base font-semibold text-white shadow-lg shadow-[#fe2c55]/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate All Platform Content"}
          </button>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-end">
              <CopyButton
                text={allContent}
                label="Copy all platforms"
                className="rounded-xl bg-[#fe2c55]/20 px-4 py-2 text-sm text-[#fe2c55] hover:bg-[#fe2c55]/30"
              />
            </div>
            {PLATFORMS.map(({ key, label, emoji }) => (
              <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span>{emoji}</span> {label}
                  </h3>
                  <CopyButton
                    text={result[key]}
                    label="Copy"
                    className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                  />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                  {result[key]}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
