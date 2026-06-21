"use client";

import type { AnalysisResult, UploadMediaType } from "@/lib/types";
import type { KeyFrame } from "@/lib/extract-video-keyframes";
import { CopyButton } from "./CopyButton";
import { PostOnTikTokPanel } from "./PostOnTikTokPanel";
import { EnhancedMediaPreview } from "./EnhancedMediaPreview";

interface VideoStrategyDashboardProps {
  result: AnalysisResult;
  keyFrames?: KeyFrame[];
  mediaPreviewUrl?: string;
  enhancedMediaUrl?: string | null;
  mediaType?: UploadMediaType;
  mediaFile?: File;
}

export function VideoStrategyDashboard({
  result,
  keyFrames,
  mediaPreviewUrl,
  enhancedMediaUrl,
  mediaType = "video",
  mediaFile,
}: VideoStrategyDashboardProps) {
  const hashtagString = result.hashtags.join(" ");
  const hooks = result.viralHooks ?? [result.viralHook];
  const fullStrategy = [
    result.videoSummary && `VIDEO SUMMARY\n${result.videoSummary}`,
    `\nTOP HOOK\n${result.viralHook}`,
    `\nCAPTION\n${result.captions[0]}`,
    `\nHASHTAGS\n${hashtagString}`,
    result.thumbnailTexts?.length &&
      `\nTHUMBNAIL TEXT\n${result.thumbnailTexts[0]}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
          {result.country}
        </span>
        <span className="rounded-full border border-[#25f4ee]/20 bg-[#25f4ee]/10 px-4 py-1.5 text-xs font-medium text-[#25f4ee]">
          {result.niche}
        </span>
        <span className="rounded-full border border-[#fe2c55]/20 bg-[#fe2c55]/10 px-4 py-1.5 text-xs font-medium text-[#fe2c55]">
          Video Strategy
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Key frames" value={String(keyFrames?.length ?? 5)} />
        <StatCard label="Hooks" value={String(hooks.length)} />
        <StatCard label="Captions" value={String(result.captions.length)} />
        <StatCard label="Hashtags" value={String(result.hashtags.length)} />
      </div>

      {keyFrames && keyFrames.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            Extracted key frames
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {keyFrames.map((frame) => (
              <div key={frame.label} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.previewUrl}
                  alt={frame.label}
                  className="aspect-[9/16] w-full rounded-lg object-cover"
                />
                <p className="mt-1 text-[10px] font-medium text-white/50">{frame.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.videoSummary && (
        <section className="rounded-xl border border-[#25f4ee]/30 bg-gradient-to-br from-[#25f4ee]/10 to-transparent p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Video Analysis</h3>
            <CopyButton
              text={result.videoSummary}
              label="Copy"
              className="bg-[#25f4ee]/20 text-[#25f4ee] hover:bg-[#25f4ee]/30"
            />
          </div>
          <p className="text-sm leading-relaxed text-white/90">{result.videoSummary}</p>
          {result.keyMoments && result.keyMoments.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
              {result.keyMoments.map((moment, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/70">
                  <span className="shrink-0 font-bold text-[#25f4ee]">{i + 1}.</span>
                  <span>{moment}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <StrategySection
        title="Viral Hooks"
        subtitle={`${hooks.length} options · First 3 sec`}
        copyText={hooks.map((h, i) => `${i + 1}. ${h}`).join("\n\n")}
        accent="pink"
      >
        <div className="space-y-3">
          {hooks.map((hook, index) => (
            <div
              key={index}
              className={`rounded-lg border p-3 ${
                index === 0
                  ? "border-[#fe2c55]/30 bg-[#fe2c55]/10"
                  : "border-white/5 bg-black/20"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#fe2c55]">
                  {index === 0 ? "Top pick" : `Hook ${index + 1}`}
                </span>
                <CopyButton
                  text={hook}
                  label="Copy"
                  className="bg-[#fe2c55]/20 text-[#fe2c55] hover:bg-[#fe2c55]/30"
                />
              </div>
              <p className="text-sm font-medium leading-relaxed text-white">{hook}</p>
            </div>
          ))}
        </div>
      </StrategySection>

      <StrategySection
        title="Captions"
        subtitle="5 options"
        copyText={result.captions.map((c, i) => `${i + 1}. ${c}`).join("\n\n")}
      >
        <ol className="space-y-3">
          {result.captions.map((caption, index) => (
            <li key={index} className="rounded-lg border border-white/5 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#25f4ee]">Option {index + 1}</span>
                <CopyButton
                  text={caption}
                  label="Copy"
                  className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                {caption}
              </p>
            </li>
          ))}
        </ol>
      </StrategySection>

      <StrategySection title="Hashtags" subtitle={`${result.hashtags.length} tags`} copyText={hashtagString}>
        <div className="flex flex-wrap gap-2">
          {result.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#25f4ee]/10 px-3 py-1 text-xs font-medium text-[#25f4ee]"
            >
              {tag}
            </span>
          ))}
        </div>
      </StrategySection>

      {result.thumbnailTexts && result.thumbnailTexts.length > 0 && (
        <StrategySection
          title="Thumbnail Text"
          subtitle="5 overlay options"
          copyText={result.thumbnailTexts.join("\n")}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {result.thumbnailTexts.map((text, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-4 py-3"
              >
                <span className="text-sm font-bold tracking-wide text-white">{text}</span>
                <CopyButton
                  text={text}
                  label="Copy"
                  className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                />
              </div>
            ))}
          </div>
        </StrategySection>
      )}

      {result.engagementTips && result.engagementTips.length > 0 && (
        <StrategySection
          title="Engagement Boosters"
          subtitle="Improve watch time & interactions"
          copyText={result.engagementTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}
          accent="cyan"
        >
          <ul className="space-y-3">
            {result.engagementTips.map((tip, index) => (
              <li key={index} className="flex gap-3 rounded-lg border border-[#25f4ee]/10 bg-[#25f4ee]/5 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25f4ee]/20 text-xs font-bold text-[#25f4ee]">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-white/90">{tip}</span>
              </li>
            ))}
          </ul>
        </StrategySection>
      )}

      {result.contentVariations && result.contentVariations.length > 0 && (
        <StrategySection
          title="Content Variations"
          subtitle="3 alternate versions"
          copyText={result.contentVariations
            .map(
              (v, i) =>
                `${i + 1}. ${v.title}\nHook: ${v.hook}\nCaption: ${v.caption}\nAngle: ${v.angle}`,
            )
            .join("\n\n")}
        >
          <div className="space-y-4">
            {result.contentVariations.map((variation, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#fe2c55]/20 bg-gradient-to-br from-[#fe2c55]/5 to-transparent p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{variation.title}</h4>
                  <CopyButton
                    text={`${variation.hook}\n\n${variation.caption}`}
                    label="Copy"
                    className="bg-[#fe2c55]/20 text-[#fe2c55] hover:bg-[#fe2c55]/30"
                  />
                </div>
                <p className="mb-2 text-xs font-medium text-[#fe2c55]">{variation.hook}</p>
                <p className="mb-2 text-sm text-white/80">{variation.caption}</p>
                <p className="text-xs text-white/50">
                  <span className="font-medium text-white/60">Angle:</span> {variation.angle}
                </p>
              </div>
            ))}
          </div>
        </StrategySection>
      )}

      <StrategySection
        title="Follow-up Ideas"
        subtitle="3 next videos"
        copyText={result.contentIdeas.map((idea, i) => `${i + 1}. ${idea}`).join("\n")}
      >
        <ol className="space-y-3">
          {result.contentIdeas.map((idea, index) => (
            <li key={index} className="flex gap-3 text-sm text-white/90">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fe2c55]/20 text-xs font-bold text-[#fe2c55]">
                {index + 1}
              </span>
              <span className="leading-relaxed">{idea}</span>
            </li>
          ))}
        </ol>
      </StrategySection>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">
            Complete strategy
          </span>
          <CopyButton
            text={fullStrategy}
            label="Copy all"
            className="bg-[#fe2c55]/20 text-[#fe2c55] hover:bg-[#fe2c55]/30"
          />
        </div>
        <p className="whitespace-pre-wrap text-sm text-white/70">{fullStrategy}</p>
      </div>

      {mediaPreviewUrl && (
        <EnhancedMediaPreview
          originalUrl={mediaPreviewUrl}
          enhancedUrl={enhancedMediaUrl}
          mediaType={mediaType}
        />
      )}

      {result.finalPost && (
        <PostOnTikTokPanel
          result={result}
          mediaFile={mediaFile}
          enhancedMediaUrl={enhancedMediaUrl}
          mediaType={mediaType}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}

interface StrategySectionProps {
  title: string;
  subtitle?: string;
  copyText: string;
  accent?: "pink" | "cyan";
  children: React.ReactNode;
}

function StrategySection({
  title,
  subtitle,
  copyText,
  accent,
  children,
}: StrategySectionProps) {
  return (
    <section
      className={`rounded-xl border bg-white/5 p-4 sm:p-5 ${
        accent === "pink"
          ? "border-[#fe2c55]/20"
          : accent === "cyan"
            ? "border-[#25f4ee]/20"
            : "border-white/10"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
        </div>
        <CopyButton
          text={copyText}
          label="Copy all"
          className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
        />
      </div>
      {children}
    </section>
  );
}
