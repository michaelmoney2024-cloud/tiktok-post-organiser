import type {
  AgeGroup,
  AudienceTargeting,
  Country,
  Language,
  Niche,
  ToolkitTool,
  ViralScore,
} from "@/lib/types";

export const COUNTRY_GUIDANCE: Record<Country, string> = {
  Nigeria:
    "Target Nigerian TikTok audiences. Use Naija-friendly tone where natural. Reference Nigerian culture, cities, Afrobeats, Nollywood, and local creator styles.",
  Canada:
    "Target Canadian TikTok audiences. Use Canadian cultural references, bilingual awareness where relevant, and Canadian lifestyle trends.",
  USA:
    "Target US TikTok audiences. Use American pop culture references, US trending formats, and direct punchy delivery.",
  UK:
    "Target UK TikTok audiences. Use British humor, UK slang where natural, and UK TikTok trends.",
  "South Africa":
    "Target South African TikTok audiences. Use Mzansi-friendly tone, local cultural references, and SA creator trends.",
};

export const NICHE_GUIDANCE: Record<Niche, string> = {
  Comedy:
    "Comedy lens: punchlines, relatable humor, skit-style hooks, meme references, and funny POV angles.",
  Lifestyle:
    "Lifestyle lens: daily routines, aesthetics, self-care, vlogs, relatable moments, and aspirational vibes.",
  Business:
    "Business lens: value-driven hooks, tips, behind-the-scenes, motivation, and actionable insights.",
  Gaming:
    "Gaming lens: hype moments, clutch plays, reactions, game references, and streamer energy.",
  Fashion:
    "Fashion lens: outfit details, styling tips, trends, GRWM energy, and visual appeal.",
  Sports:
    "Sports lens: athletic moments, training, game day energy, highlights, and competitive spirit.",
  Music:
    "Music lens: artist energy, performance vibes, sound trends, lyrical hooks, and musical moments.",
};

export const LANGUAGE_GUIDANCE: Record<Language, string> = {
  English: "Write in natural, fluent English suited to the target region's dialect where appropriate.",
  French: "Write in natural French. Use Québec-friendly phrasing for Canadian audiences where relevant.",
  Spanish: "Write in natural Spanish with Latin American or US Hispanic TikTok tone where relevant.",
  Portuguese: "Write in natural Portuguese with Brazilian TikTok energy where relevant.",
  Yoruba: "Blend authentic Yoruba phrases where natural — keep hooks clear and punchy.",
  Igbo: "Blend authentic Igbo phrases where natural — keep content readable for mixed audiences.",
  Hausa: "Blend authentic Hausa phrases where natural — keep hooks direct and engaging.",
  Afrikaans: "Use natural Afrikaans suited to South African TikTok; mix with English if that's the local norm.",
  Zulu: "Blend authentic Zulu phrases where natural — keep content accessible to broader SA audiences.",
};

export const AGE_GROUP_GUIDANCE: Record<AgeGroup, string> = {
  "Gen Z (13-17)":
    "Gen Z: fast-paced, trend-native, meme-literate, authenticity over polish, avoid corporate tone.",
  "Young Adults (18-24)":
    "18-24: college/early career energy, identity exploration, trend participation, raw and relatable.",
  "Millennials (25-34)":
    "25-34: nostalgia hooks, life-stage content, value + entertainment, polished but still casual.",
  "Adults (35-44)":
    "35-44: practical value, family/career balance, clear takeaways, credibility over hype.",
  "45+": "45+: clear direct language, wisdom/experience angles, practical tips, minimal Gen Z slang.",
  "All Ages":
    "Broad appeal: universal hooks, accessible language, widely relatable emotions and topics.",
};

export function buildAudienceContext(audience: AudienceTargeting, topic?: string): string {
  const { country, language, ageGroup, niche } = audience;

  return `You are a top-tier TikTok growth strategist for ${niche} creators.

AUDIENCE TARGETING — optimize ALL output for this exact audience:
- Country/Region: ${country}
- Language: ${language}
- Age group: ${ageGroup}
- Niche: ${niche}

Country (${country}): ${COUNTRY_GUIDANCE[country]}
Language (${language}): ${LANGUAGE_GUIDANCE[language]}
Age group (${ageGroup}): ${AGE_GROUP_GUIDANCE[ageGroup]}
Niche (${niche}): ${NICHE_GUIDANCE[niche]}
${topic ? `\nContent topic/context: ${topic}` : ""}

Write captions, hooks, and text primarily in ${language}. Match tone and references to ${ageGroup} viewers in ${country}.`;
}

const AUDIENCE_OUTPUT_FIELDS = `
  "audienceInsights": ["4-5 specific insights about this target audience — what they watch, share, and respond to on TikTok"],
  "engagementRecommendations": ["4-5 actionable recommendations to maximize engagement with this audience — tone, CTAs, trends, posting style"]`;

const AUDIENCE_OUTPUT_RULES = `
Always include audienceInsights (4-5 items) and engagementRecommendations (4-5 items) tailored to the selected country, language, age group, and niche.`;

const VIRAL_SCORE_FIELDS = `
  "viralScore": {
    "overall": 85,
    "hookStrength": 90,
    "captionQuality": 82,
    "hashtagRelevance": 88,
    "audienceTargeting": 80,
    "engagementPotential": 86,
    "strengths": ["2-4 specific strengths"],
    "weaknesses": ["2-4 specific weaknesses"],
    "suggestions": ["3-5 actionable improvements"]
  }`;

const VIRAL_SCORE_RULES = `
Score viralScore 0-100 for each dimension based on the generated content and audience fit. Be honest and specific in strengths, weaknesses, and suggestions.`;

export function buildImageAnalysisPrompt(audience: AudienceTargeting): string {
  const ctx = buildAudienceContext(audience);

  return `${ctx}

Analyze the uploaded image and produce scroll-stopping, algorithm-friendly TikTok content.

Return JSON with exactly this shape:
{
  "viralHook": "A punchy 1-2 sentence hook for the first 3 seconds",
  "captions": ["5 caption options, 2-4 sentences each, distinct angles, no hashtags"],
  "hashtags": ["exactly 20 hashtags starting with #"],
  "contentIdeas": ["3 follow-up video concepts"],
${AUDIENCE_OUTPUT_FIELDS},
${VIRAL_SCORE_FIELDS}
}

Rules:
- viralHook: max 2 sentences, no hashtags, native to this audience
- captions: exactly 5, in ${audience.language}, emojis ok, no hashtags inside captions
- hashtags: exactly 20, mix ${audience.country}, ${audience.niche}, and age-relevant tags
- contentIdeas: exactly 3 actionable concepts for this audience
${AUDIENCE_OUTPUT_RULES}
${VIRAL_SCORE_RULES}

Be specific to what's in the image. Never generic filler.`;
}

export function buildToolkitPrompt(
  tool: ToolkitTool,
  audience: AudienceTargeting,
  topic: string,
): string {
  const ctx = buildAudienceContext(audience, topic);
  const audienceRules = `\n${AUDIENCE_OUTPUT_RULES}`;
  const audienceExtras = `
Also return:
${AUDIENCE_OUTPUT_FIELDS}`;

  switch (tool) {
    case "captions":
      return `${ctx}

Generate exactly 5 viral TikTok captions in ${audience.language}. Each 2-4 sentences, distinct angles. Emojis ok, no hashtags.

Return JSON: { "items": ["caption1", "caption2", "caption3", "caption4", "caption5"]${audienceExtras} }${audienceRules}`;

    case "hashtags":
      return `${ctx}

Generate exactly 20 TikTok hashtags for ${audience.country} ${audience.ageGroup} ${audience.niche} audiences. All start with #.

Return JSON: { "items": ["#tag1", ...]${audienceExtras} }${audienceRules}`;

    case "hooks":
      return `${ctx}

Generate exactly 5 viral hooks in ${audience.language} for the first 3 seconds. Max 2 sentences each, no hashtags.

Return JSON: { "items": ["hook1", ...]${audienceExtras} }${audienceRules}`;

    case "thumbnail-text":
      return `${ctx}

Generate exactly 5 thumbnail overlay texts in ${audience.language}, 3-8 words, ALL CAPS where natural.

Return JSON: { "items": ["TEXT 1", ...]${audienceExtras} }${audienceRules}`;

    case "posting-times":
      return `${ctx}

Recommend best posting times for ${audience.niche} creators targeting ${audience.country} ${audience.ageGroup} audiences.

Return JSON:
{
  "recommendations": [
    { "day": "Monday", "times": ["6:00 PM", "9:00 PM"], "reason": "Why this works for this audience" },
    ...7 days
  ]${audienceExtras}
}${audienceRules}`;

    case "content-ideas":
      return `${ctx}

Generate exactly 8 TikTok content ideas in ${audience.language} for this audience.

Return JSON: { "items": ["idea1", ...]${audienceExtras} }${audienceRules}`;
  }
}

export function buildVideoStrategyPrompt(
  audience: AudienceTargeting,
  frameLabels: string[],
): string {
  const ctx = buildAudienceContext(audience);

  return `${ctx}

You are analyzing a TikTok video through ${frameLabels.length} key frames: ${frameLabels.join(", ")}.

Study ALL frames together — opening hook potential, pacing, visual story arc, subject, mood, and ${audience.niche} fit. Never generic filler.

Return JSON with exactly this shape:
{
  "videoSummary": "2-3 sentence summary",
  "keyMoments": ["Opening: ...", "Early: ...", "Midpoint: ...", "Late: ...", "Closing: ..."],
  "viralHook": "Best hook for first 3 seconds in ${audience.language}",
  "viralHooks": ["5 distinct hooks in ${audience.language}"],
  "captions": ["5 captions in ${audience.language}"],
  "hashtags": ["20 hashtags for ${audience.country} ${audience.ageGroup} audience"],
  "thumbnailTexts": ["5 thumbnail texts in ${audience.language}"],
  "engagementTips": ["5-8 video-specific improvement tips"],
  "contentVariations": [
    { "title": "...", "hook": "...", "caption": "...", "angle": "..." }
  ],
  "contentIdeas": ["3 follow-up concepts"],
${AUDIENCE_OUTPUT_FIELDS},
${VIRAL_SCORE_FIELDS}
}

Rules:
- All text output in ${audience.language} unless blending regional phrases
- viralHooks: 5, captions: 5, hashtags: 20, thumbnailTexts: 5
- engagementTips: 5-8 video edit/pacing improvements
- contentVariations: exactly 3
- contentIdeas: exactly 3
${AUDIENCE_OUTPUT_RULES}
${VIRAL_SCORE_RULES}

Optimize for ${audience.ageGroup} viewers in ${audience.country}.`;
}

export function parseAudienceInsights(data: Record<string, unknown>): {
  audienceInsights?: string[];
  engagementRecommendations?: string[];
} {
  const audienceInsights = Array.isArray(data.audienceInsights)
    ? (data.audienceInsights as unknown[]).filter((i) => typeof i === "string").slice(0, 5)
    : undefined;
  const engagementRecommendations = Array.isArray(data.engagementRecommendations)
    ? (data.engagementRecommendations as unknown[])
        .filter((i) => typeof i === "string")
        .slice(0, 5)
    : undefined;
  return {
    audienceInsights: audienceInsights?.length ? audienceInsights : undefined,
    engagementRecommendations: engagementRecommendations?.length
      ? engagementRecommendations
      : undefined,
  };
}

export function parseViralScore(data: Record<string, unknown>): ViralScore | undefined {
  const vs = data.viralScore;
  if (!vs || typeof vs !== "object") return undefined;
  const s = vs as Record<string, unknown>;
  const num = (k: string) => (typeof s[k] === "number" ? (s[k] as number) : 0);
  const strs = (k: string) =>
    Array.isArray(s[k]) ? (s[k] as unknown[]).filter((i) => typeof i === "string") as string[] : [];

  const score = {
    overall: num("overall"),
    hookStrength: num("hookStrength"),
    captionQuality: num("captionQuality"),
    hashtagRelevance: num("hashtagRelevance"),
    audienceTargeting: num("audienceTargeting"),
    engagementPotential: num("engagementPotential"),
    strengths: strs("strengths"),
    weaknesses: strs("weaknesses"),
    suggestions: strs("suggestions"),
  };

  if (score.overall <= 0) return undefined;
  return score;
}

export function buildStudioPrompt(audience: AudienceTargeting): string {
  const ctx = buildAudienceContext(audience);
  return `${ctx}

Analyze the uploaded media and generate platform-specific content optimized for this audience.

Return JSON:
{
  "tiktokCaption": "TikTok caption with hook, emojis, hashtags at end",
  "instagramCaption": "Instagram caption, storytelling style, hashtags",
  "youtubeShortsTitle": "Catchy YouTube Shorts title under 70 chars",
  "youtubeDescription": "YouTube description with keywords and CTA",
  "twitterPost": "X/Twitter post under 280 chars, punchy",
  "facebookPost": "Facebook post, conversational, shareable",
  "linkedinPost": "LinkedIn post, professional but engaging"
}

All content in ${audience.language}. Tailor tone to ${audience.ageGroup} in ${audience.country}.`;
}

export function buildTrendingSoundsPrompt(audience: AudienceTargeting, topic: string): string {
  const ctx = buildAudienceContext(audience, topic);
  return `${ctx}

Suggest trending audio categories and music styles for this content in ${audience.country}.

Return JSON:
{
  "audioCategories": ["5-8 audio categories trending on TikTok in ${audience.country}"],
  "musicStyles": ["5-8 music genres/styles that fit this content"],
  "sounds": [
    {
      "name": "Sound style name",
      "category": "Category",
      "style": "Music style",
      "whyItFits": "Why this fits the content and ${audience.country} audience",
      "usageTip": "How to use it in the video"
    }
  ]
}

Provide exactly 6 sound suggestions. Focus on what's trending in ${audience.country} for ${audience.niche} content targeting ${audience.ageGroup}.`;
}
