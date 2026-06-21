"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { ResultsPanel } from "@/components/ResultsPanel";
import {
  clearHistory,
  deleteFromHistory,
  formatSavedDate,
  getHistory,
  type SavedResult,
} from "@/lib/history";

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
        <header className="mb-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            History
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Your saved TikTok content results
          </p>
        </header>

        <AppNav />

        {!loaded ? (
          <div className="py-16 text-center text-sm text-white/40">Loading...</div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/30">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/60">No saved results yet</p>
            <p className="mt-1 text-xs text-white/40">
              Generate content and tap Save Result to keep it here
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Create content
            </Link>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                          {item.result.country}
                        </span>
                        <span className="rounded-full bg-[#25f4ee]/10 px-2 py-0.5 text-[10px] font-medium text-[#25f4ee]">
                          {item.result.niche}
                        </span>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium capitalize text-white/40">
                          {item.mediaType}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-white/90">
                        {item.result.viralHook}
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
                      <ResultsPanel result={item.result} />
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
