import type { Country, Niche } from "@/lib/types";
import { getCountryGuidance, getNicheGuidance } from "@/lib/audience";
import type { ToolkitTool } from "@/lib/types";

function baseContext(country: Country, niche: Niche, topic: string): string {
  return `You are a top-tier TikTok growth strategist for ${niche} creators in ${country}.

Country targeting (${country}):
${getCountryGuidance(country)}

Niche targeting (${niche}):
${getNicheGuidance(niche)}

Content topic/context: ${topic || "General content for this niche"}`;
}

export function buildImageAnalysisPrompt(country: Country, niche: Niche): string {
  return `You are a top-tier TikTok growth strategist who has helped ${niche} creators go viral in ${country}. Analyze the uploaded media and produce scroll-stopping, algorithm-friendly content for the ${niche} niche, specifically for a ${country} audience.

Study the image carefully: subject, mood, colors, setting, action, and how it fits the ${niche} niche. Tailor every output to what you actually see — never generic filler.

Country targeting (${country}):
${getCountryGuidance(country)}

Niche targeting (${niche}):
${getNicheGuidance(niche)}

Return JSON with exactly this shape:
{
  "viralHook": "A punchy 1-2 sentence hook for the first 3 seconds that stops the scroll. Use curiosity, tension, or a bold claim. Speak directly to the viewer in a way that resonates with ${country} ${niche} audiences.",
  "captions": [
    "Caption option 1 — distinct angle (e.g. storytelling)",
    "Caption option 2 — distinct angle (e.g. humor)",
    "Caption option 3 — distinct angle (e.g. educational)",
    "Caption option 4 — distinct angle (e.g. relatable POV)",
    "Caption option 5 — distinct angle (e.g. call-to-action)"
  ],
  "hashtags": ["#tag1", "#tag2", ... exactly 20 tags],
  "contentIdeas": [
    "Follow-up video idea 1 with a clear concept",
    "Follow-up video idea 2 with a clear concept",
    "Follow-up video idea 3 with a clear concept"
  ]
}

Rules:
- viralHook: max 2 sentences, no hashtags, designed to be spoken or shown as on-screen text in the first 3 seconds. Must feel native to ${country} ${niche} TikTok.
- captions: exactly 5 options, each 2-4 sentences, each with a different tone/angle suited to ${niche}. Use emojis naturally but don't overdo it. No hashtags inside captions. Language and references must feel authentic to ${country} viewers.
- hashtags: exactly 20 tags, all starting with #. Include at least 5 country-specific tags for ${country}, at least 5 ${niche}-specific community tags, plus content-relevant niche tags. Mix broad, niche, and discovery tags.
- contentIdeas: exactly 3 actionable follow-up video concepts for ${niche} creators, relevant to ${country} audiences.

Write like a real ${country} ${niche} creator, not a brand. Be specific to what's in the image. Optimize for watch time, saves, and shares in the ${niche} niche on ${country} TikTok.`;
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
${getCountryGuidance(country)}

Niche targeting (${niche}):
${getNicheGuidance(niche)}

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
