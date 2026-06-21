"use client";

import { SUGGESTED_NICHES } from "@/lib/audience";
import type { Niche } from "@/lib/types";

interface NicheSelectProps {
  value: Niche;
  onChange: (niche: Niche) => void;
  disabled?: boolean;
}

const NICHE_ICONS: Record<string, string> = {
  Comedy: "😂",
  Lifestyle: "✨",
  Business: "💼",
  Gaming: "🎮",
  Fashion: "👗",
  Sports: "⚽",
  Music: "🎵",
  Food: "🍳",
  Travel: "✈️",
  Beauty: "💄",
  Fitness: "💪",
  Education: "📚",
  Tech: "💻",
  Dance: "💃",
  Pets: "🐾",
};

export function NicheSelect({ value, onChange, disabled }: NicheSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="niche" className="block text-sm font-medium text-white/70">
        Content niche
      </label>
      <input
        id="niche"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type any niche (e.g. Cooking, ASMR, Finance...)"
        maxLength={60}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-medium text-white transition placeholder:text-white/30 focus:border-[#25f4ee]/50 focus:outline-none focus:ring-2 focus:ring-[#25f4ee]/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_NICHES.map((niche) => (
          <button
            key={niche}
            type="button"
            disabled={disabled}
            onClick={() => onChange(niche)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              value.toLowerCase() === niche.toLowerCase()
                ? "border-[#25f4ee]/40 bg-[#25f4ee]/15 text-[#25f4ee]"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
            }`}
          >
            {NICHE_ICONS[niche] ?? "✨"} {niche}
          </button>
        ))}
      </div>
      <p className="text-xs text-white/40">
        Type any niche or pick a suggestion — content styled for{" "}
        {value.trim() || "your niche"}
      </p>
    </div>
  );
}
