"use client";

import { AGE_GROUPS, type AgeGroup } from "@/lib/types";

interface AgeGroupSelectProps {
  value: AgeGroup;
  onChange: (ageGroup: AgeGroup) => void;
  disabled?: boolean;
}

export function AgeGroupSelect({ value, onChange, disabled }: AgeGroupSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="ageGroup" className="block text-sm font-medium text-white/70">
        Audience age group
      </label>
      <div className="relative">
        <select
          id="ageGroup"
          value={value}
          onChange={(e) => onChange(e.target.value as AgeGroup)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm font-medium text-white transition focus:border-[#25f4ee]/50 focus:outline-none focus:ring-2 focus:ring-[#25f4ee]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {AGE_GROUPS.map((ageGroup) => (
            <option key={ageGroup} value={ageGroup} className="bg-[#1a1a1a] text-white">
              {ageGroup}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/40">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <p className="text-xs text-white/40">Tone and references tuned for {value}</p>
    </div>
  );
}
