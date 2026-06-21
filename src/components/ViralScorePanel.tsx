"use client";

import type { ViralScore } from "@/lib/types";
import { CopyButton } from "./CopyButton";

interface ViralScorePanelProps {
  score: ViralScore;
}

const DIMENSIONS: { key: keyof ViralScore; label: string; color: string }[] = [
  { key: "hookStrength", label: "Hook Strength", color: "#fe2c55" },
  { key: "captionQuality", label: "Caption Quality", color: "#25f4ee" },
  { key: "hashtagRelevance", label: "Hashtag Relevance", color: "#25f4ee" },
  { key: "audienceTargeting", label: "Audience Targeting", color: "#fe2c55" },
  { key: "engagementPotential", label: "Engagement Potential", color: "#25f4ee" },
];

function scoreColor(score: number): string {
  if (score >= 80) return "text-[#25f4ee]";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

export function ViralScorePanel({ score }: ViralScorePanelProps) {
  const report = [
    `Viral Score: ${score.overall}/100`,
    "",
    "Breakdown:",
    ...DIMENSIONS.map((d) => `- ${d.label}: ${score[d.key]}/100`),
    "",
    "Strengths:",
    ...score.strengths.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Weaknesses:",
    ...score.weaknesses.map((w, i) => `${i + 1}. ${w}`),
    "",
    "Suggestions:",
    ...score.suggestions.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#fe2c55]/30 bg-[#fe2c55]/10">
            <span className={`text-2xl font-bold ${scoreColor(score.overall)}`}>
              {score.overall}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Viral Score</h3>
            <p className="text-xs text-white/40">Content performance rating</p>
          </div>
        </div>
        <CopyButton
          text={report}
          label="Copy report"
          className="bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
        />
      </div>

      <div className="mb-4 space-y-2">
        {DIMENSIONS.map(({ key, label, color }) => {
          const val = score[key] as number;
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-white/60">{label}</span>
                <span className={`font-bold ${scoreColor(val)}`}>{val}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${val}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ScoreList title="Strengths" items={score.strengths} accent="cyan" />
        <ScoreList title="Weaknesses" items={score.weaknesses} accent="pink" />
        <ScoreList title="Suggestions" items={score.suggestions} accent="white" />
      </div>
    </section>
  );
}

function ScoreList({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: "cyan" | "pink" | "white";
}) {
  const dotColor =
    accent === "cyan" ? "bg-[#25f4ee]" : accent === "pink" ? "bg-[#fe2c55]" : "bg-white/50";

  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs text-white/80">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
