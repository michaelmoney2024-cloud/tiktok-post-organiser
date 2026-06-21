"use client";

import { COUNTRIES, type Country } from "@/lib/types";

interface CountrySelectProps {
  value: Country;
  onChange: (country: Country) => void;
  disabled?: boolean;
}

const COUNTRY_FLAGS: Record<Country, string> = {
  Nigeria: "🇳🇬",
  Canada: "🇨🇦",
  USA: "🇺🇸",
  UK: "🇬🇧",
  "South Africa": "🇿🇦",
};

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="country" className="block text-sm font-medium text-white/70">
        Target audience
      </label>
      <div className="relative">
        <select
          id="country"
          value={value}
          onChange={(e) => onChange(e.target.value as Country)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm font-medium text-white transition focus:border-[#25f4ee]/50 focus:outline-none focus:ring-2 focus:ring-[#25f4ee]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {COUNTRIES.map((country) => (
            <option key={country} value={country} className="bg-[#1a1a1a] text-white">
              {COUNTRY_FLAGS[country]} {country}
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
        Captions and hashtags will be tailored for {value}
      </p>
    </div>
  );
}
