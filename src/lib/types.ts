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

export const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Afrikaans",
  "Zulu",
] as const;

export type Language = (typeof LANGUAGES)[number];

export const AGE_GROUPS = [
  "Gen Z (13-17)",
  "Young Adults (18-24)",
  "Millennials (25-34)",
  "Adults (35-44)",
  "45+",
  "All Ages",
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

export interface AudienceTargeting {
  country: Country;
  language: Language;
  ageGroup: AgeGroup;
  niche: Niche;
}

export interface ContentVariation {
  title: string;
  hook: string;
  caption: string;
  angle: string;
}

export interface AnalysisResult {
  country: Country;
  language: Language;
  ageGroup: AgeGroup;
  niche: Niche;
  viralHook: string;
  captions: string[];
  hashtags: string[];
  contentIdeas: string[];
  audienceInsights?: string[];
  engagementRecommendations?: string[];
  isVideoStrategy?: boolean;
  videoSummary?: string;
  keyMoments?: string[];
  viralHooks?: string[];
  thumbnailTexts?: string[];
  engagementTips?: string[];
  contentVariations?: ContentVariation[];
  viralScore?: ViralScore;
}

export interface ViralScore {
  overall: number;
  hookStrength: number;
  captionQuality: number;
  hashtagRelevance: number;
  audienceTargeting: number;
  engagementPotential: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface TrendingSound {
  name: string;
  category: string;
  style: string;
  whyItFits: string;
  usageTip: string;
}

export interface TrendingSoundsResult {
  country: Country;
  niche: Niche;
  audioCategories: string[];
  musicStyles: string[];
  sounds: TrendingSound[];
}

export interface StudioResult {
  country: Country;
  language: Language;
  niche: Niche;
  tiktokCaption: string;
  instagramCaption: string;
  youtubeShortsTitle: string;
  youtubeDescription: string;
  twitterPost: string;
  facebookPost: string;
  linkedinPost: string;
}

export type CalendarPostStatus = "draft" | "scheduled" | "posted";

export interface CalendarPost {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  scheduledDate: string;
  scheduledTime?: string;
  status: CalendarPostStatus;
  reminderEnabled: boolean;
  createdAt: string;
  postedAt?: string;
  niche?: Niche;
  country?: Country;
}

export interface GrowthSnapshot {
  id: string;
  date: string;
  followers: number;
  avgEngagement: number;
  postsCount: number;
}

export interface CreatorGoal {
  id: string;
  type: "followers" | "engagement" | "posts";
  target: number;
  deadline: string;
  createdAt: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  postsScheduled: number;
  postsPublished: number;
  followerChange: number;
  avgEngagement: number;
  topNiche: string;
  highlights: string[];
  recommendations: string[];
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
  language: Language;
  ageGroup: AgeGroup;
  niche: Niche;
  topic: string;
  items?: string[];
  recommendations?: PostingTimeRecommendation[];
  audienceInsights?: string[];
  engagementRecommendations?: string[];
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
