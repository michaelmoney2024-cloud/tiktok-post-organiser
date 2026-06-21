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
  TrendingSoundsResult,
} from "@/lib/types";

export default function SoundsPage() {
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [country, setCountry] = useState<Country>("USA");
  const [language, setLanguage] = useState<Language>("English");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("All Ages");
  const [niche, setNiche] = useState<Niche>("Music");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<TrendingSoundsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("country", country);
      formData.append("language", language);
      formData.append("ageGroup", ageGroup);
      formData.append("niche", niche);
      formData.append("topic", topic.trim());
      if (media) formData.append("file", media.file);

      const res = await fetch("/api/trending-sounds", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get suggestions");
      setResult(data as TrendingSoundsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [media, country, language, ageGroup, niche, topic]);

  return (
    <PageLayout
      title="Trending Sounds"
      subtitle="Audio categories & music styles that fit your content and region"
      badge="Audio AI"
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

        <div>
          <label htmlFor="topic" className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
            Content description (optional)
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            placeholder="Describe your video content..."
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#25f4ee]/50 focus:outline-none"
          />
        </div>

        <section className="relative">
          <p className="mb-2 text-xs text-white/40">Optional: upload content for better sound matching</p>
          <UploadZone
            media={media}
            onMediaSelect={(m) => { setMedia(m); setResult(null); }}
            onClear={() => { if (media?.previewUrl) URL.revokeObjectURL(media.previewUrl); setMedia(null); }}
            disabled={loading}
          />
          {loading && <LoadingOverlay message="Finding trending sounds..." />}
        </section>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-4 text-base font-semibold text-white shadow-lg shadow-[#fe2c55]/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Suggest Trending Sounds"}
        </button>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TagSection title="Audio Categories" tags={result.audioCategories} />
              <TagSection title="Music Styles" tags={result.musicStyles} />
            </div>

            <h3 className="text-sm font-semibold text-white">Recommended Sounds</h3>
            {result.sounds.map((sound, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{sound.name}</h4>
                    <p className="text-xs text-[#25f4ee]">{sound.category} · {sound.style}</p>
                  </div>
                  <CopyButton
                    text={`${sound.name}\n${sound.whyItFits}\nTip: ${sound.usageTip}`}
                    label="Copy"
                    className="bg-white/10 text-white/70 hover:bg-white/15"
                  />
                </div>
                <p className="mb-1 text-sm text-white/80">{sound.whyItFits}</p>
                <p className="text-xs text-white/50">💡 {sound.usageTip}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageLayout>
  );
}

function TagSection({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[#25f4ee]/10 px-3 py-1 text-xs font-medium text-[#25f4ee]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
