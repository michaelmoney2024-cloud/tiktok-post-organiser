"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COUNTRY_LIST, countryFlag, filterCountries, type CountryEntry } from "@/lib/countries";
import type { Country } from "@/lib/types";

interface CountrySelectProps {
  value: Country;
  onChange: (country: Country) => void;
  disabled?: boolean;
}

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(() => filterCountries(query).slice(0, 12), [query]);

  const selectedEntry = useMemo(
    () => COUNTRY_LIST.find((c) => c.name === value),
    [value],
  );

  const selectCountry = useCallback(
    (entry: CountryEntry) => {
      onChange(entry.name);
      setQuery(entry.name);
      setOpen(false);
    },
    [onChange],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label htmlFor="country" className="block text-sm font-medium text-white/70">
        Target audience
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-base">
          {selectedEntry ? countryFlag(selectedEntry.code) : "🌍"}
        </span>
        <input
          id="country"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder="Search country..."
          autoComplete="off"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm font-medium text-white transition placeholder:text-white/30 focus:border-[#25f4ee]/50 focus:outline-none focus:ring-2 focus:ring-[#25f4ee]/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/10 bg-[#1a1a1a] py-1 shadow-xl">
            {filtered.map((entry) => (
              <li key={entry.code}>
                <button
                  type="button"
                  onClick={() => selectCountry(entry)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-white/10 ${
                    entry.name === value ? "bg-[#25f4ee]/10 text-[#25f4ee]" : "text-white"
                  }`}
                >
                  <span>{countryFlag(entry.code)}</span>
                  <span>{entry.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-white/40">
        {COUNTRY_LIST.length} countries · Captions tailored for {value}
      </p>
    </div>
  );
}
