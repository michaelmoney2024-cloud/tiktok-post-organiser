"use client";

import { useCallback, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { CountrySelect } from "@/components/CountrySelect";
import { NicheSelect } from "@/components/NicheSelect";
import { ToolCard } from "@/components/ToolCard";
import { ToolkitResults } from "@/components/ToolkitResults";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import {
  TOOLKIT_LABELS,
  TOOLKIT_TOOLS,
  type Country,
  type Niche,
  type ToolkitResult,
  type ToolkitTool,
} from "@/lib/types";

export default function ToolkitPage() {
  const [selectedTool, setSelectedTool] = useState<ToolkitTool>("captions");
  const [country, setCountry] = useState<Country>("USA");
  const [niche, setNiche] = useState<Niche>("Lifestyle");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<ToolkitResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTopic = selectedTool !== "posting-times";
  const toolMeta = TOOLKIT_LABELS[selectedTool];

  const handleToolSelect = useCallback((tool: ToolkitTool) => {
    setSelectedTool(tool);
    setResult(null);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (needsTopic && !topic.trim()) {
      setError("Please describe your content topic");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: selectedTool,
          country,
          niche,
          topic: topic.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResult(data as ToolkitResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTool, country, niche, topic, needsTopic]);

  return (
    <div className="min-h-full bg-[#0f0f0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#fe2c55]/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#25f4ee]/15 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-[#fe2c55]/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25f4ee]" />
            Creator Toolkit
          </div>
          <h1 className="bg-gradient-to-r from-[#25f4ee] via-white to-[#fe2c55] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            AI Creator Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/50 sm:text-base">
            6 AI-powered tools to grow your TikTok — captions, hooks, hashtags &amp; more
          </p>
        </header>

        <AppNav />

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {TOOLKIT_TOOLS.map((tool) => {
            const meta = TOOLKIT_LABELS[tool];
            return (
              <ToolCard
                key={tool}
                emoji={meta.emoji}
                title={meta.title}
                description={meta.description}
                selected={selectedTool === tool}
                onClick={() => handleToolSelect(tool)}
                disabled={isGenerating}
              />
            );
          })}
        </div>

        <main className="space-y-6">
          <section className="relative rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fe2c55]/20 to-[#25f4ee]/20 text-xl">
                {toolMeta.emoji}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">{toolMeta.title}</h2>
                <p className="text-xs text-white/50">{toolMeta.description}</p>
              </div>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <CountrySelect
                value={country}
                onChange={setCountry}
                disabled={isGenerating}
              />
              <NicheSelect
                value={niche}
                onChange={setNiche}
                disabled={isGenerating}
              />
            </div>

            {needsTopic && (
              <div className="mb-5">
                <label
                  htmlFor="topic"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40"
                >
                  Content topic
                </label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                  placeholder="e.g. Morning routine vlog, gym transformation, small business tips..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#25f4ee]/50 focus:outline-none focus:ring-2 focus:ring-[#25f4ee]/20 disabled:opacity-50"
                />
              </div>
            )}

            {!needsTopic && (
              <p className="mb-5 rounded-xl border border-[#25f4ee]/20 bg-[#25f4ee]/5 px-4 py-3 text-sm text-[#25f4ee]/80">
                Posting time recommendations are based on your selected country and niche — no topic needed.
              </p>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-4 text-base font-semibold text-white shadow-lg shadow-[#fe2c55]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : `Generate ${toolMeta.title}`}
            </button>
            {isGenerating && (
              <LoadingOverlay message="AI is crafting your content..." />
            )}
          </section>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {result && <ToolkitResults result={result} />}
        </main>

        <footer className="mt-12 text-center text-xs text-white/30">
          All outputs can be copied or saved to history
        </footer>
      </div>
    </div>
  );
}
