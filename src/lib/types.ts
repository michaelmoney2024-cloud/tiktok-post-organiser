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

export interface ContentVariation {
  title: string;
  hook: string;
  caption: string;
  angle: string;
}

export interface AnalysisResult {
  country: Country;
  niche: Niche;
  viralHook: string;
  captions: string[];
  hashtags: string[];
  contentIdeas: string[];
  isVideoStrategy?: boolean;
  videoSummary?: string;
  keyMoments?: string[];
  viralHooks?: string[];
  thumbnailTexts?: string[];
  engagementTips?: string[];
  contentVariations?: ContentVariation[];
  finalPost?: FinalPost;
  mediaEnhancement?: MediaEnhancement;
}

export interface RankedCaption {
  index: number;
  text: string;
  engagementScore: number;
  reason: string;
}

export interface MediaEnhancement {
  tips: string[];
  applied: string[];
}

export interface FinalPost {
  rankedCaptions: RankedCaption[];
  selectedCaptionIndex: number;
  finalCaption: string;
  finalHashtags: string[];
  postOnTikTok: string;
  cleanupNotes: string[];
}

export type UploadMediaType = "image" | "video";

export interface MediaPreview {
  file: File;
  type: UploadMediaType;
  previewUrl: string;
}

export const TOOLKIT_TOOLS = [
  "captions",
  "hashtags",
  "hooks",
  "thumbnail-text",
  "posting-times",
  "content-ideas",
] as const;

export type ToolkitTool = (typeof TOOLKIT_TOOLS)[number];

export interface PostingTimeRecommendation {
  day: string;
  times: string[];
  reason: string;
}

export interface ToolkitResult {
  tool: ToolkitTool;
  country: Country;
  niche: Niche;
  topic: string;
  items?: string[];
  recommendations?: PostingTimeRecommendation[];
}

export const TOOLKIT_LABELS: Record<
  ToolkitTool,
  { title: string; description: string; emoji: string }
> = {
  captions: {
    title: "Caption Generator",
    description: "5 scroll-stopping captions for any topic",
    emoji: "✍️",
  },
  hashtags: {
    title: "Hashtag Generator",
    description: "20 niche & location-targeted hashtags",
    emoji: "#️⃣",
  },
  hooks: {
    title: "Viral Hook Generator",
    description: "5 first-3-second hooks that stop the scroll",
    emoji: "⚡",
  },
  "thumbnail-text": {
    title: "Thumbnail Text",
    description: "Punchy overlay text for video thumbnails",
    emoji: "🖼️",
  },
  "posting-times": {
    title: "Best Posting Times",
    description: "Peak engagement windows for your audience",
    emoji: "🕐",
  },
  "content-ideas": {
    title: "Content Ideas",
    description: "8 ready-to-film video concepts",
    emoji: "💡",
  },
};
