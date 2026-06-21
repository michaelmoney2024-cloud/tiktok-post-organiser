import type { Country, Niche, ToolkitTool } from "@/lib/types";

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

function baseContext(country: Country, niche: Niche, topic: string): string {
  return `You are a top-tier TikTok growth strategist for ${niche} creators in ${country}.

Country targeting (${country}):
${COUNTRY_GUIDANCE[country]}

Niche targeting (${niche}):
${NICHE_GUIDANCE[niche]}

Content topic/context: ${topic || "General content for this niche"}`;
}

export function buildToolkitPrompt(
  tool: ToolkitTool,
  country: Country,
  niche: Niche,
  topic: string,
): string {
  const ctx = baseContext(country, niche, topic);

  switch (tool) {
    case "captions":
      return `${ctx}

Generate exactly 5 viral TikTok captions for this topic. Each caption should be 2-4 sentences with a distinct angle (storytelling, humor, educational, relatable POV, call-to-action). Use emojis naturally. No hashtags inside captions.

Return JSON: { "items": ["caption1", "caption2", "caption3", "caption4", "caption5"] }`;

    case "hashtags":
      return `${ctx}

Generate exactly 20 TikTok hashtags for this topic. Mix broad discovery tags, ${niche}-specific community tags, and ${country}-specific tags. All must start with #.

Return JSON: { "items": ["#tag1", "#tag2", ...] }`;

    case "hooks":
      return `${ctx}

Generate exactly 5 viral hooks designed for the first 3 seconds of a TikTok. Each hook should stop the scroll using curiosity, tension, or a bold claim. Max 2 sentences each. No hashtags.

Return JSON: { "items": ["hook1", "hook2", "hook3", "hook4", "hook5"] }`;

    case "thumbnail-text":
      return `${ctx}

Generate exactly 5 short thumbnail text overlays (3-8 words each) that would appear on a TikTok video thumbnail. They should be punchy, readable, and create curiosity. Use ALL CAPS for emphasis where natural.

Return JSON: { "items": ["TEXT 1", "TEXT 2", "TEXT 3", "TEXT 4", "TEXT 5"] }`;

    case "posting-times":
      return `${ctx}

Recommend the best posting times for a ${niche} TikTok creator targeting ${country} audiences. Consider timezone habits, peak engagement windows, and day-of-week patterns for this market.

Return JSON:
{
  "recommendations": [
    { "day": "Monday", "times": ["6:00 PM", "9:00 PM"], "reason": "Why this works" },
    ...for each day of the week (7 entries)
  ]
}`;

    case "content-ideas":
      return `${ctx}

Generate exactly 8 actionable TikTok content ideas related to this topic. Each should be a clear video concept a creator could film today.

Return JSON: { "items": ["idea1", "idea2", ...] }`;
  }
}

export function buildVideoStrategyPrompt(
  country: Country,
  niche: Niche,
  frameLabels: string[],
): string {
  return `You are a top-tier TikTok growth strategist who has helped ${niche} creators go viral in ${country}.

You are analyzing a TikTok video through ${frameLabels.length} key frames captured at different timestamps: ${frameLabels.join(", ")}.

Study ALL frames together to understand the full video narrative: opening hook potential, pacing, visual story arc, subject, mood, colors, setting, action, and how it fits the ${niche} niche. Never give generic filler — be specific to what you see across the frames.

Country targeting (${country}):
${COUNTRY_GUIDANCE[country]}

Niche targeting (${niche}):
${NICHE_GUIDANCE[niche]}

Return JSON with exactly this shape:
{
  "videoSummary": "2-3 sentence summary of what the video shows and its core message",
  "keyMoments": ["Opening: description of frame 1", "Early: ...", "Midpoint: ...", "Late: ...", "Closing: ..."],
  "viralHook": "The single best hook for the first 3 seconds",
  "viralHooks": ["5 distinct viral hooks for the first 3 seconds, each max 2 sentences, no hashtags"],
  "captions": ["5 caption options, 2-4 sentences each, distinct angles, emojis ok, no hashtags"],
  "hashtags": ["exactly 20 hashtags starting with #"],
  "thumbnailTexts": ["5 short punchy thumbnail overlay texts, 3-8 words, ALL CAPS where natural"],
  "engagementTips": ["5-8 specific actionable tips to improve this video's engagement — pacing, hook, CTA, text overlays, sound, cuts, etc."],
  "contentVariations": [
    { "title": "Variation name", "hook": "Opening hook", "caption": "Full caption", "angle": "What makes this angle unique" }
  ],
  "contentIdeas": ["3 follow-up video concepts"]
}

Rules:
- viralHooks: exactly 5 options
- captions: exactly 5 options
- hashtags: exactly 20, mix ${country} and ${niche} tags
- thumbnailTexts: exactly 5 options
- engagementTips: 5-8 specific improvements based on what you see in the frames
- contentVariations: exactly 3 complete alternate versions of this video with different angles/hooks/captions
- contentIdeas: exactly 3 follow-up concepts

Write like a real ${country} ${niche} creator. Optimize for watch time, saves, shares, and comments.`;
}
