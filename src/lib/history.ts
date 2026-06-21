import type { AnalysisResult, Country, Niche, ToolkitResult, UploadMediaType } from "./types";

export interface SavedAnalysis {
  id: string;
  savedAt: string;
  source: "analyze";
  mediaType: UploadMediaType;
  thumbnail: string;
  result: AnalysisResult;
}

export interface SavedToolkit {
  id: string;
  savedAt: string;
  source: "toolkit";
  toolResult: ToolkitResult;
}

export type SavedResult = SavedAnalysis | SavedToolkit;

const STORAGE_KEY = "tiktok-post-organizer-history";
const MAX_ITEMS = 50;

function readRaw(): SavedResult[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedResult[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEntry);
  } catch {
    return [];
  }
}

function normalizeEntry(entry: SavedResult): SavedResult {
  if ("source" in entry && entry.source === "toolkit") return entry;
  if ("source" in entry && entry.source === "analyze") return entry;
  // Legacy entries from before toolkit
  const legacy = entry as SavedAnalysis & { source?: string };
  return {
    id: legacy.id,
    savedAt: legacy.savedAt,
    source: "analyze",
    mediaType: legacy.mediaType,
    thumbnail: legacy.thumbnail,
    result: legacy.result,
  };
}

export function getHistory(): SavedResult[] {
  return readRaw();
}

export function saveToHistory(
  result: AnalysisResult,
  mediaType: UploadMediaType,
  thumbnail: string,
): SavedAnalysis {
  const entry: SavedAnalysis = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    source: "analyze",
    mediaType,
    thumbnail,
    result,
  };

  const history = [entry, ...readRaw()].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function saveToolkitToHistory(toolResult: ToolkitResult): SavedToolkit {
  const entry: SavedToolkit = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    source: "toolkit",
    toolResult,
  };

  const history = [entry, ...readRaw()].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function deleteFromHistory(id: string): void {
  const history = readRaw().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatSavedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getHistoryPreview(item: SavedResult): string {
  if (item.source === "toolkit") {
    const { toolResult } = item;
    if (toolResult.items?.[0]) return toolResult.items[0];
    if (toolResult.recommendations?.[0]) {
      const r = toolResult.recommendations[0];
      return `${r.day}: ${r.times.join(", ")}`;
    }
    return toolResult.topic;
  }
  if (item.result.isVideoStrategy && item.result.videoSummary) {
    return item.result.videoSummary;
  }
  return item.result.viralHook;
}

export function getHistoryMeta(item: SavedResult): { country: Country; niche: Niche } {
  if (item.source === "toolkit") {
    return { country: item.toolResult.country, niche: item.toolResult.niche };
  }
  return { country: item.result.country, niche: item.result.niche };
}
