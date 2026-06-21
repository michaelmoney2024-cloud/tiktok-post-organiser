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
