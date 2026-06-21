import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import {
  AGE_GROUPS,
  COUNTRIES,
  LANGUAGES,
  NICHES,
  type AnalysisResult,
  type AgeGroup,
  type AudienceTargeting,
  type Country,
  type Language,
  type Niche,
} from "@/lib/types";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildVideoStrategyPrompt, parseAudienceInsights, parseViralScore } from "@/lib/ai/prompts";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FRAMES = 5;

function isValidCountry(value: string | null): value is Country {
  return typeof value === "string" && COUNTRIES.includes(value as Country);
}

function isValidNiche(value: string | null): value is Niche {
  return typeof value === "string" && NICHES.includes(value as Niche);
}

function isValidLanguage(value: string | null): value is Language {
  return typeof value === "string" && LANGUAGES.includes(value as Language);
}

function isValidAgeGroup(value: string | null): value is AgeGroup {
  return typeof value === "string" && AGE_GROUPS.includes(value as AgeGroup);
}

function validateVideoResult(
  data: unknown,
): data is Omit<AnalysisResult, "country" | "language" | "ageGroup" | "niche" | "isVideoStrategy"> {
  if (!data || typeof data !== "object") return false;
  const r = data as Record<string, unknown>;

  const hasStrings = (key: string, min: number) =>
    Array.isArray(r[key]) &&
    (r[key] as unknown[]).length >= min &&
    (r[key] as unknown[]).every((v) => typeof v === "string");

  const variations = r.contentVariations;
  const validVariations =
    Array.isArray(variations) &&
    variations.length >= 2 &&
    variations.every((v) => {
      if (!v || typeof v !== "object") return false;
      const item = v as Record<string, unknown>;
      return (
        typeof item.title === "string" &&
        typeof item.hook === "string" &&
        typeof item.caption === "string" &&
        typeof item.angle === "string"
      );
    });

  return (
    typeof r.videoSummary === "string" &&
    r.videoSummary.length > 0 &&
    hasStrings("keyMoments", 3) &&
    typeof r.viralHook === "string" &&
    hasStrings("viralHooks", 3) &&
    hasStrings("captions", 5) &&
    hasStrings("hashtags", 15) &&
    hasStrings("thumbnailTexts", 3) &&
    hasStrings("engagementTips", 4) &&
    validVariations &&
    hasStrings("contentIdeas", 3)
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const countryInput = formData.get("country") as string | null;
    const languageInput = formData.get("language") as string | null;
    const ageGroupInput = formData.get("ageGroup") as string | null;
    const nicheInput = formData.get("niche") as string | null;
    const labelsRaw = formData.get("frameLabels") as string | null;

    if (!isValidCountry(countryInput)) {
      return NextResponse.json({ error: "Invalid country selected" }, { status: 400 });
    }
    if (!isValidLanguage(languageInput)) {
      return NextResponse.json({ error: "Invalid language selected" }, { status: 400 });
    }
    if (!isValidAgeGroup(ageGroupInput)) {
      return NextResponse.json({ error: "Invalid age group selected" }, { status: 400 });
    }
    if (!isValidNiche(nicheInput)) {
      return NextResponse.json({ error: "Invalid niche selected" }, { status: 400 });
    }

    const frames = formData.getAll("frames") as File[];
    if (frames.length === 0) {
      return NextResponse.json({ error: "No video frames provided" }, { status: 400 });
    }
    if (frames.length > MAX_FRAMES) {
      return NextResponse.json({ error: "Too many frames" }, { status: 400 });
    }

    for (const frame of frames) {
      if (frame.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Frame too large. Maximum size is 20MB." },
          { status: 400 },
        );
      }
    }

    let frameLabels: string[] = [];
    try {
      frameLabels = labelsRaw ? (JSON.parse(labelsRaw) as string[]) : [];
    } catch {
      frameLabels = [];
    }
    while (frameLabels.length < frames.length) {
      frameLabels.push(`Frame ${frameLabels.length + 1}`);
    }

    const audience: AudienceTargeting = {
      country: countryInput,
      language: languageInput,
      ageGroup: ageGroupInput,
      niche: nicheInput,
    };

    const openai = getOpenAIClient();

    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Analyze this TikTok video using ${frames.length} key frames (${frameLabels.join(" → ")}). Build a complete content strategy for ${audience.ageGroup} ${audience.language}-speaking ${audience.niche} viewers in ${audience.country}.`,
      },
    ];

    for (let i = 0; i < frames.length; i++) {
      const buffer = Buffer.from(await frames[i].arrayBuffer());
      const base64 = buffer.toString("base64");
      userContent.push({ type: "text", text: `Frame ${i + 1} (${frameLabels[i]}):` });
      userContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${base64}`, detail: "high" },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildVideoStrategyPrompt(audience, frameLabels) },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (!validateVideoResult(parsed)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const normalizeTags = (tags: string[]) =>
      tags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

    const insights = parseAudienceInsights(parsed);
    const viralScore = parseViralScore(parsed);

    return NextResponse.json({
      ...audience,
      isVideoStrategy: true,
      videoSummary: parsed.videoSummary as string,
      keyMoments: (parsed.keyMoments as string[]).slice(0, 5),
      viralHook: parsed.viralHook as string,
      viralHooks: (parsed.viralHooks as string[]).slice(0, 5),
      captions: (parsed.captions as string[]).slice(0, 5),
      hashtags: normalizeTags(parsed.hashtags as string[]).slice(0, 20),
      thumbnailTexts: (parsed.thumbnailTexts as string[]).slice(0, 5),
      engagementTips: (parsed.engagementTips as string[]).slice(0, 8),
      contentVariations: parsed.contentVariations,
      contentIdeas: (parsed.contentIdeas as string[]).slice(0, 3),
      ...insights,
      viralScore,
    } satisfies AnalysisResult);
  } catch (error) {
    console.error("Video analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze video";
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 90;
