"use client";

import type { AgeGroup, AudienceTargeting, Country, Language, Niche } from "@/lib/types";
import { CountrySelect } from "./CountrySelect";
import { LanguageSelect } from "./LanguageSelect";
import { AgeGroupSelect } from "./AgeGroupSelect";
import { NicheSelect } from "./NicheSelect";

interface AudienceTargetingPanelProps {
  country: Country;
  language: Language;
  ageGroup: AgeGroup;
  niche: Niche;
  onCountryChange: (country: Country) => void;
  onLanguageChange: (language: Language) => void;
  onAgeGroupChange: (ageGroup: AgeGroup) => void;
  onNicheChange: (niche: Niche) => void;
  disabled?: boolean;
}

export function AudienceTargetingPanel({
  country,
  language,
  ageGroup,
  niche,
  onCountryChange,
  onLanguageChange,
  onAgeGroupChange,
  onNicheChange,
  disabled,
}: AudienceTargetingPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#fe2c55]/20 to-[#25f4ee]/20 text-sm">
          🎯
        </span>
        <div>
          <h2 className="text-sm font-semibold text-white">Audience Targeting</h2>
          <p className="text-xs text-white/40">AI optimizes all content for your selected audience</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CountrySelect value={country} onChange={onCountryChange} disabled={disabled} />
        <LanguageSelect value={language} onChange={onLanguageChange} disabled={disabled} />
        <AgeGroupSelect value={ageGroup} onChange={onAgeGroupChange} disabled={disabled} />
        <NicheSelect value={niche} onChange={onNicheChange} disabled={disabled} />
      </div>
    </section>
  );
}

export function audienceFromProps(
  country: Country,
  language: Language,
  ageGroup: AgeGroup,
  niche: Niche,
): AudienceTargeting {
  return { country, language, ageGroup, niche };
}
