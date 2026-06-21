"use client";

import { LANGUAGES, type Language } from "@/lib/types";

interface LanguageSelectProps {
  value: Language;
  onChange: (language: Language) => void;
  disabled?: boolean;
}

export function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="language" className="block text-sm font-medium text-white/70">
        Language
      </label>
      <div className="relative">
        <select
          id="language"
          value={value}
          onChange={(e) => onChange(e.target.value as Language)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm font-medium text-white transition focus:border-[#25f4ee]/50 focus:outline-none focus:ring-2 focus:ring-[#25f4ee]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {LANGUAGES.map((language) => (
            <option key={language} value={language} className="bg-[#1a1a1a] text-white">
              {language}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/40">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <p className="text-xs text-white/40">Content generated in {value}</p>
    </div>
  );
}
