"use client";

import { NICHES, type Niche } from "@/lib/types";

interface NicheSelectProps {
  value: Niche;
  onChange: (niche: Niche) => void;
  disabled?: boolean;
}

const NICHE_ICONS: Record<Niche, string> = {
  Comedy: "😂",
  Lifestyle: "✨",
  Business: "💼",
  Gaming: "🎮",
  Fashion: "👗",
  Sports: "⚽",
  Music: "🎵",
};

export function NicheSelect({ value, onChange, disabled }: NicheSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="niche" className="block text-sm font-medium text-white/70">
        Content niche
      </label>
      <div className="relative">
        <select
          id="niche"
          value={value}
          onChange={(e) => onChange(e.target.value as Niche)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm font-medium text-white transition focus:border-[#25f4ee]/50 focus:outline-none focus:ring-2 focus:ring-[#25f4ee]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {NICHES.map((niche) => (
            <option key={niche} value={niche} className="bg-[#1a1a1a] text-white">
              {NICHE_ICONS[niche]} {niche}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/40">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <p className="text-xs text-white/40">
        Content styled for the {value.toLowerCase()} niche
      </p>
    </div>
  );
}
