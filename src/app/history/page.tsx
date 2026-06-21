"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { AppHeader } from "@/components/AppHeader";
import { AppLogo } from "@/components/AppLogo";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VideoStrategyDashboard } from "@/components/VideoStrategyDashboard";
import { ToolkitResults } from "@/components/ToolkitResults";
import {
  clearHistory,
  deleteFromHistory,
  formatSavedDate,
  getHistory,
  getHistoryMeta,
  getHistoryPreview,
  type SavedResult,
} from "@/lib/history";
import { TOOLKIT_LABELS } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<SavedResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setHistory(getHistory());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteFromHistory(id);
      if (expandedId === id) setExpandedId(null);
      refresh();
    },
    [expandedId, refresh],
  );

  const handleClearAll = useCallback(() => {
    if (history.length === 0) return;
    if (!window.confirm("Delete all saved results? This cannot be undone.")) return;
    clearHistory();
    setExpandedId(null);
    refresh();
  }, [history.length, refresh]);

  return (
    <div className="min-h-full bg-[#0f0f0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#fe2c55]/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#25f4ee]/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-8 sm:max-w-xl sm:px-6 sm:py-12">
        <AppHeader
          pageTitle="History"
          subtitle="Your saved content & toolkit generations"
        />

        <AppNav />

        {!loaded ? (
          <div className="py-16 text-center text-sm text-white/40">Loading...</div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
            <div className="mx-auto mb-4 flex justify-center opacity-40">
              <AppLogo href="" className="opacity-40" />
            </div>
            <p className="text-sm font-medium text-white/60">No saved results yet</p>
            <p className="mt-1 text-xs text-white/40">
              Generate content and tap Save to keep it here
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/"
                className="rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Create content
              </Link>
              <Link
                href="/toolkit"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Open toolkit
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/40">
                {history.length} saved {history.length === 1 ? "result" : "results"}
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-medium text-red-400/80 transition hover:text-red-300"
              >
                Clear all
              </button>
            </div>

            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              const meta = getHistoryMeta(item);
              const preview = getHistoryPreview(item);
              const isToolkit = item.source === "toolkit";
              const toolLabel = isToolkit
                ? TOOLKIT_LABELS[item.toolResult.tool]
                : null;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex w-full gap-3 p-3 text-left transition hover:bg-white/[0.03] sm:gap-4 sm:p-4"
                  >
                    {isToolkit ? (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#fe2c55]/20 to-[#25f4ee]/20 text-2xl sm:h-20 sm:w-20">
                        {toolLabel?.emoji}
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                          {meta.country}
                        </span>
                        <span className="rounded-full bg-[#25f4ee]/10 px-2 py-0.5 text-[10px] font-medium text-[#25f4ee]">
                          {meta.niche}
                        </span>
                        {isToolkit && toolLabel && (
                          <span className="rounded-full bg-[#fe2c55]/10 px-2 py-0.5 text-[10px] font-medium text-[#fe2c55]">
                            {toolLabel.title}
                          </span>
                        )}
                        {!isToolkit && (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium capitalize text-white/40">
                            {item.mediaType}
                            {item.result.isVideoStrategy ? " · strategy" : ""}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-white/90">
                        {preview}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {formatSavedDate(item.savedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center text-white/30">
                      <svg
                        className={`h-5 w-5 transition ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 sm:p-5">
                      {isToolkit ? (
                        <ToolkitResults result={item.toolResult} hideSave />
                      ) : item.result.isVideoStrategy ? (
                        <VideoStrategyDashboard result={item.result} />
                      ) : (
                        <ResultsPanel result={item.result} />
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="mt-4 w-full rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
