"use client";

import { useCallback, useState } from "react";
import type { ToolkitResult } from "@/lib/types";
import { TOOLKIT_LABELS } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { saveToolkitToHistory } from "@/lib/history";

interface ToolkitResultsProps {
  result: ToolkitResult;
  hideSave?: boolean;
}

export function ToolkitResults({ result, hideSave }: ToolkitResultsProps) {
  const [saved, setSaved] = useState(false);
  const meta = TOOLKIT_LABELS[result.tool];

  const handleSave = useCallback(() => {
    saveToolkitToHistory(result);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [result]);

  const allText = result.items
    ? result.items.map((item, i) => `${i + 1}. ${item}`).join("\n\n")
    : result.recommendations
        ?.map((r) => `${r.day}\n${r.times.join(", ")}\n${r.reason}`)
        .join("\n\n") ?? "";

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
          {result.country}
        </span>
        <span className="rounded-full border border-[#25f4ee]/20 bg-[#25f4ee]/10 px-4 py-1.5 text-xs font-medium text-[#25f4ee]">
          {result.niche}
        </span>
        <span className="rounded-full border border-[#fe2c55]/20 bg-[#fe2c55]/10 px-4 py-1.5 text-xs font-medium text-[#fe2c55]">
          {meta.emoji} {meta.title}
        </span>
      </div>

      {result.tool === "hashtags" && result.items && (
        <ResultSection title="Hashtags" copyText={result.items.join(" ")} copyLabel="Copy all">
          <div className="flex flex-wrap gap-2">
            {result.items.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#25f4ee]/10 px-3 py-1 text-xs font-medium text-[#25f4ee]"
              >
                {tag}
              </span>
            ))}
          </div>
        </ResultSection>
      )}

      {result.tool === "posting-times" && result.recommendations && (
        <ResultSection
          title="Best Posting Times"
          copyText={allText}
          copyLabel="Copy schedule"
        >
          <div className="space-y-3">
            {result.recommendations.map((rec) => (
              <div
                key={rec.day}
                className="rounded-lg border border-white/5 bg-black/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{rec.day}</span>
                  <CopyButton
                    text={`${rec.day}: ${rec.times.join(", ")}\n${rec.reason}`}
                    label="Copy"
                    className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                  />
                </div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {rec.times.map((time) => (
                    <span
                      key={time}
                      className="rounded-lg bg-[#fe2c55]/20 px-2.5 py-1 text-xs font-bold text-[#fe2c55]"
                    >
                      {time}
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-white/60">{rec.reason}</p>
              </div>
            ))}
          </div>
        </ResultSection>
      )}

      {result.items && result.tool !== "hashtags" && (
        <ResultSection
          title={meta.title}
          copyText={allText}
          copyLabel="Copy all"
        >
          <ol className="space-y-3">
            {result.items.map((item, index) => (
              <li
                key={index}
                className="rounded-lg border border-white/5 bg-black/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#25f4ee]">
                    {result.tool === "hooks" ? `Hook ${index + 1}` : `Option ${index + 1}`}
                  </span>
                  <CopyButton
                    text={item}
                    label="Copy"
                    className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                  />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </ResultSection>
      )}

      <div className="flex gap-3">
        {!hideSave && (
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-3 text-sm font-semibold text-white shadow-lg shadow-[#fe2c55]/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            {saved ? "Saved to history!" : "Save to history"}
          </button>
        )}
        {allText && (
          <CopyButton
            text={allText}
            label="Copy all"
            className={`rounded-xl bg-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/15 hover:text-white ${hideSave ? "flex-1 justify-center" : ""}`}
          />
        )}
      </div>
    </div>
  );
}

interface ResultSectionProps {
  title: string;
  copyText: string;
  copyLabel: string;
  children: React.ReactNode;
}

function ResultSection({ title, copyText, copyLabel, children }: ResultSectionProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
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
