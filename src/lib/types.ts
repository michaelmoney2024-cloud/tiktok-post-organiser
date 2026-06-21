export const COUNTRIES = [
  "Nigeria",
  "Canada",
  "USA",
  "UK",
  "South Africa",
] as const;

export type Country = (typeof COUNTRIES)[number];

export const NICHES = [
  "Comedy",
  "Lifestyle",
  "Business",
  "Gaming",
  "Fashion",
  "Sports",
  "Music",
] as const;

export type Niche = (typeof NICHES)[number];

export interface AnalysisResult {
  country: Country;
  niche: Niche;
  viralHook: string;
  captions: string[];
  hashtags: string[];
  contentIdeas: string[];
}

export type UploadMediaType = "image" | "video";

export interface MediaPreview {
  file: File;
  type: UploadMediaType;
  previewUrl: string;
}
