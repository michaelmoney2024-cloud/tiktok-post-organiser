"use client";

import type { AnalysisResult, UploadMediaType } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { PostOnTikTokPanel } from "./PostOnTikTokPanel";
import { EnhancedMediaPreview } from "./EnhancedMediaPreview";

interface ResultsPanelProps {
  result: AnalysisResult;
  mediaPreviewUrl?: string;
  enhancedMediaUrl?: string | null;
  mediaType?: UploadMediaType;
  mediaFile?: File;
}

export function ResultsPanel({
  result,
  mediaPreviewUrl,
  enhancedMediaUrl,
  mediaType = "image",
  mediaFile,
}: ResultsPanelProps) {
  const hashtagString = result.hashtags.join(" ");
  const captionsText = result.captions
    .map((caption, i) => `${i + 1}. ${caption}`)
    .join("\n\n");
  const fullPost = `${result.viralHook}\n\n${result.captions[0]}\n\n${hashtagString}`;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
          {result.country}
        </span>
        <span className="rounded-full border border-[#25f4ee]/20 bg-[#25f4ee]/10 px-4 py-1.5 text-xs font-medium text-[#25f4ee]">
          {result.niche}
        </span>
      </div>

      <div className="rounded-xl border border-[#fe2c55]/30 bg-gradient-to-br from-[#fe2c55]/10 to-transparent p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#fe2c55]">
              <HookIcon />
            </span>
            <h3 className="text-sm font-semibold text-white">Viral Hook</h3>
            <span className="rounded-full bg-[#fe2c55]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#fe2c55]">
              First 3 sec
            </span>
          </div>
          <CopyButton
            text={result.viralHook}
            label="Copy hook"
            className="bg-[#fe2c55]/20 text-[#fe2c55] hover:bg-[#fe2c55]/30"
          />
        </div>
        <p className="text-base font-medium leading-relaxed text-white">
          {result.viralHook}
        </p>
      </div>

      <ResultCard
        title="Viral Captions"
        subtitle="5 options"
        icon={<CaptionIcon />}
        copyText={captionsText}
        copyLabel="Copy all"
      >
        <ol className="space-y-4">
          {result.captions.map((caption, index) => (
            <li
              key={index}
              className="rounded-lg border border-white/5 bg-black/20 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#25f4ee]">
                  Option {index + 1}
                </span>
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
      </ResultCard>

      <ResultCard
        title="Hashtags"
        subtitle={`${result.hashtags.length} tags`}
        icon={<HashtagIcon />}
        copyText={hashtagString}
        copyLabel="Copy all"
      >
        <div className="flex flex-wrap gap-2">
          {result.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#25f4ee]/10 px-3 py-1 text-xs font-medium text-[#25f4ee]"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </ResultCard>

      <ResultCard
        title="Content Ideas"
        subtitle="3 follow-ups"
        icon={<LightbulbIcon />}
        copyText={result.contentIdeas.map((idea, i) => `${i + 1}. ${idea}`).join("\n")}
        copyLabel="Copy ideas"
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
      </ResultCard>

      {!result.finalPost && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-white/40">
              Ready-to-post
            </span>
            <CopyButton
              text={fullPost}
              label="Copy all"
              className="bg-[#fe2c55]/20 text-[#fe2c55] hover:bg-[#fe2c55]/30"
            />
          </div>
          <p className="whitespace-pre-wrap text-sm text-white/70">
            {fullPost}
          </p>
        </div>
      )}

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

interface ResultCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  copyText: string;
  copyLabel: string;
  children: React.ReactNode;
}

function ResultCard({ title, subtitle, icon, copyText, copyLabel, children }: ResultCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#fe2c55]">{icon}</span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && (
            <span className="text-xs text-white/40">{subtitle}</span>
          )}
        </div>
        <CopyButton
          text={copyText}
          label={copyLabel}
          className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
        />
      </div>
      {children}
    </div>
  );
}

function HookIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CaptionIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  );
}

function HashtagIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
