"use client";

import { CopyButton } from "./CopyButton";

interface AudienceInsightsPanelProps {
  audienceInsights?: string[];
  engagementRecommendations?: string[];
  country?: string;
  language?: string;
  ageGroup?: string;
  niche?: string;
}

export function AudienceInsightsPanel({
  audienceInsights,
  engagementRecommendations,
  country,
  language,
  ageGroup,
  niche,
}: AudienceInsightsPanelProps) {
  if (!audienceInsights?.length && !engagementRecommendations?.length) return null;

  const insightsText = audienceInsights?.map((i, n) => `${n + 1}. ${i}`).join("\n") ?? "";
  const engagementText =
    engagementRecommendations?.map((i, n) => `${n + 1}. ${i}`).join("\n") ?? "";

  return (
    <div className="space-y-4">
      {(country || language || ageGroup || niche) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {country && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
              {country}
            </span>
          )}
          {language && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
              {language}
            </span>
          )}
          {ageGroup && (
            <span className="rounded-full border border-[#fe2c55]/20 bg-[#fe2c55]/10 px-3 py-1 text-xs font-medium text-[#fe2c55]">
              {ageGroup}
            </span>
          )}
          {niche && (
            <span className="rounded-full border border-[#25f4ee]/20 bg-[#25f4ee]/10 px-3 py-1 text-xs font-medium text-[#25f4ee]">
              {niche}
            </span>
          )}
        </div>
      )}

      {audienceInsights && audienceInsights.length > 0 && (
        <section className="rounded-xl border border-[#25f4ee]/20 bg-gradient-to-br from-[#25f4ee]/10 to-transparent p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Audience Insights</h3>
              <p className="text-xs text-white/40">What your target audience responds to</p>
            </div>
            <CopyButton
              text={insightsText}
              label="Copy"
              className="bg-[#25f4ee]/20 text-[#25f4ee] hover:bg-[#25f4ee]/30"
            />
          </div>
          <ul className="space-y-2">
            {audienceInsights.map((insight, index) => (
              <li key={index} className="flex gap-2 text-sm text-white/90">
                <span className="shrink-0 font-bold text-[#25f4ee]">{index + 1}.</span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {engagementRecommendations && engagementRecommendations.length > 0 && (
        <section className="rounded-xl border border-[#fe2c55]/20 bg-gradient-to-br from-[#fe2c55]/10 to-transparent p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Engagement Recommendations</h3>
              <p className="text-xs text-white/40">How to maximize reach with this audience</p>
            </div>
            <CopyButton
              text={engagementText}
              label="Copy"
              className="bg-[#fe2c55]/20 text-[#fe2c55] hover:bg-[#fe2c55]/30"
            />
          </div>
          <ul className="space-y-2">
            {engagementRecommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 text-sm text-white/90">
                <span className="shrink-0 font-bold text-[#fe2c55]">{index + 1}.</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function AudienceBadges({
  country,
  language,
  ageGroup,
  niche,
}: {
  country: string;
  language?: string;
  ageGroup?: string;
  niche: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
        {country}
      </span>
      {language && (
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
          {language}
        </span>
      )}
      {ageGroup && (
        <span className="rounded-full border border-[#fe2c55]/20 bg-[#fe2c55]/10 px-4 py-1.5 text-xs font-medium text-[#fe2c55]">
          {ageGroup}
        </span>
      )}
      <span className="rounded-full border border-[#25f4ee]/20 bg-[#25f4ee]/10 px-4 py-1.5 text-xs font-medium text-[#25f4ee]">
        {niche}
      </span>
    </div>
  );
}
