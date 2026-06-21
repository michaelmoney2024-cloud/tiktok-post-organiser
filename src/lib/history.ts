import type { AnalysisResult, UploadMediaType } from "./types";

export interface SavedResult {
  id: string;
  savedAt: string;
  mediaType: UploadMediaType;
  thumbnail: string;
  result: AnalysisResult;
}

const STORAGE_KEY = "tiktok-post-organizer-history";
const MAX_ITEMS = 50;

export function getHistory(): SavedResult[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToHistory(
  result: AnalysisResult,
  mediaType: UploadMediaType,
  thumbnail: string,
): SavedResult {
  const entry: SavedResult = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    mediaType,
    thumbnail,
    result,
  };

  const history = [entry, ...getHistory()].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((item) => item.id !== id);
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
