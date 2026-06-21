import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import {
  COUNTRIES,
  NICHES,
  type AnalysisResult,
  type Country,
  type Niche,
} from "@/lib/types";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildVideoStrategyPrompt } from "@/lib/ai/prompts";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FRAMES = 5;

function isValidCountry(value: string | null): value is Country {
  return typeof value === "string" && COUNTRIES.includes(value as Country);
}

function isValidNiche(value: string | null): value is Niche {
  return typeof value === "string" && NICHES.includes(value as Niche);
}

function validateVideoResult(
  data: unknown,
): data is Omit<AnalysisResult, "country" | "niche" | "isVideoStrategy"> {
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
    const nicheInput = formData.get("niche") as string | null;
    const labelsRaw = formData.get("frameLabels") as string | null;

    if (!isValidCountry(countryInput)) {
      return NextResponse.json({ error: "Invalid country selected" }, { status: 400 });
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

    const country = countryInput;
    const niche = nicheInput;
    const openai = getOpenAIClient();

    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Analyze this TikTok video using the ${frames.length} key frames below (in order: ${frameLabels.slice(0, frames.length).join(" → ")}). Generate a complete content strategy for ${niche} content targeting ${country}.`,
      },
    ];

    for (let i = 0; i < frames.length; i++) {
      const buffer = Buffer.from(await frames[i].arrayBuffer());
      const base64 = buffer.toString("base64");
      userContent.push({
        type: "text",
        text: `Frame ${i + 1} (${frameLabels[i]}):`,
      });
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
          detail: "high",
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildVideoStrategyPrompt(country, niche, frameLabels) },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    if (!validateVideoResult(parsed)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const normalizeTags = (tags: string[]) =>
      tags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

    return NextResponse.json({
      country,
      niche,
      isVideoStrategy: true,
      videoSummary: parsed.videoSummary,
      keyMoments: parsed.keyMoments!.slice(0, 5),
      viralHook: parsed.viralHook,
      viralHooks: parsed.viralHooks!.slice(0, 5),
      captions: parsed.captions!.slice(0, 5),
      hashtags: normalizeTags(parsed.hashtags!).slice(0, 20),
      thumbnailTexts: parsed.thumbnailTexts!.slice(0, 5),
      engagementTips: parsed.engagementTips!.slice(0, 8),
      contentVariations: parsed.contentVariations!.slice(0, 3),
      contentIdeas: parsed.contentIdeas!.slice(0, 3),
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
