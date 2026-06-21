import { NextRequest, NextResponse } from "next/server";
import {
  COUNTRIES,
  NICHES,
  type AnalysisResult,
  type Country,
  type FinalPost,
  type Niche,
  type RankedCaption,
} from "@/lib/types";
import { getOpenAIClient } from "@/lib/ai/client";

function isValidCountry(v: unknown): v is Country {
  return typeof v === "string" && COUNTRIES.includes(v as Country);
}

function isValidNiche(v: unknown): v is Niche {
  return typeof v === "string" && NICHES.includes(v as Niche);
}

function validateFinalPost(data: unknown): data is FinalPost {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  const ranked = d.rankedCaptions;
  if (!Array.isArray(ranked) || ranked.length < 1) return false;

  for (const item of ranked) {
    if (!item || typeof item !== "object") return false;
    const r = item as Record<string, unknown>;
    if (
      typeof r.index !== "number" ||
      typeof r.text !== "string" ||
      typeof r.engagementScore !== "number" ||
      typeof r.reason !== "string"
    ) {
      return false;
    }
  }

  return (
    typeof d.selectedCaptionIndex === "number" &&
    typeof d.finalCaption === "string" &&
    Array.isArray(d.finalHashtags) &&
    (d.finalHashtags as unknown[]).every((h) => typeof h === "string") &&
    typeof d.postOnTikTok === "string" &&
    Array.isArray(d.cleanupNotes)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      viralHook,
      captions,
      hashtags,
      country,
      niche,
      mediaType = "image",
    } = body as Partial<AnalysisResult> & { mediaType?: string };

    if (!viralHook || !Array.isArray(captions) || !Array.isArray(hashtags)) {
      return NextResponse.json({ error: "Missing analysis data" }, { status: 400 });
    }
    if (!isValidCountry(country) || !isValidNiche(niche)) {
      return NextResponse.json({ error: "Invalid audience data" }, { status: 400 });
    }

    const openai = getOpenAIClient();

    const prompt = `You are a TikTok viral content optimizer for ${niche} creators in ${country}.

Analyze and rank these ${captions.length} caption options by engagement potential (watch time, saves, comments, shares).
Also curate the best hashtags — remove duplicates, irrelevant tags, and reduce to 12-15 high-impact tags.

Hook: ${viralHook}

Captions:
${captions.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Hashtags: ${hashtags.join(" ")}

Media type: ${mediaType}

Tasks:
1. Score each caption 0-100 for engagement quality
2. Rank all captions (best first)
3. Select the single best caption
4. Clean the winning caption: remove excessive emojis (max 3), fix formatting, tighten prose
5. Curate hashtags: deduplicate, remove irrelevant/generic tags, keep 12-15 best for ${country} ${niche}
6. Build final "Post On TikTok" text: hook line, blank line, cleaned caption, blank line, hashtags
7. List cleanup actions taken

Return JSON:
{
  "rankedCaptions": [
    { "index": 0, "text": "original caption text", "engagementScore": 92, "reason": "why this scores high" }
  ],
  "selectedCaptionIndex": 0,
  "finalCaption": "cleaned best caption without hook or hashtags",
  "finalHashtags": ["#tag1", "#tag2"],
  "postOnTikTok": "complete paste-ready TikTok post",
  "cleanupNotes": ["Removed 2 duplicate hashtags", "Reduced emojis from 8 to 3"],
  "mediaEnhancement": {
    "tips": ["3-5 tips to make the ${mediaType} more viral-ready"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a TikTok optimization expert. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;

    if (!validateFinalPost(parsed)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const rankedCaptions = (parsed.rankedCaptions as RankedCaption[]).sort(
      (a, b) => b.engagementScore - a.engagementScore,
    );

    const finalHashtags = (parsed.finalHashtags as string[]).map((t) =>
      t.startsWith("#") ? t : `#${t}`,
    );

    const mediaTips = parsed.mediaEnhancement as Record<string, unknown> | undefined;
    const tips = Array.isArray(mediaTips?.tips)
      ? (mediaTips.tips as unknown[]).filter((t) => typeof t === "string") as string[]
      : [];

    return NextResponse.json({
      finalPost: {
        rankedCaptions,
        selectedCaptionIndex: parsed.selectedCaptionIndex as number,
        finalCaption: parsed.finalCaption as string,
        finalHashtags,
        postOnTikTok: parsed.postOnTikTok as string,
        cleanupNotes: (parsed.cleanupNotes as string[]).filter((n) => typeof n === "string"),
      },
      mediaEnhancement: { tips, applied: [] as string[] },
    });
  } catch (error) {
    console.error("Finalize post error:", error);
    const message = error instanceof Error ? error.message : "Failed to finalize post";
    if (message.includes("API key")) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
