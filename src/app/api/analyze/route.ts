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
import { buildImageAnalysisPrompt, parseAudienceInsights, parseViralScore } from "@/lib/ai/prompts";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

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

function validateResult(
  data: unknown,
): data is Omit<AnalysisResult, "country" | "language" | "ageGroup" | "niche"> {
  if (!data || typeof data !== "object") return false;
  const result = data as Record<string, unknown>;

  return (
    typeof result.viralHook === "string" &&
    result.viralHook.length > 0 &&
    Array.isArray(result.captions) &&
    result.captions.length >= 5 &&
    result.captions.every((c) => typeof c === "string") &&
    Array.isArray(result.hashtags) &&
    result.hashtags.length >= 20 &&
    result.hashtags.every((h) => typeof h === "string") &&
    Array.isArray(result.contentIdeas) &&
    result.contentIdeas.length >= 3 &&
    result.contentIdeas.every((i) => typeof i === "string")
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const countryInput = formData.get("country") as string | null;
    const languageInput = formData.get("language") as string | null;
    const ageGroupInput = formData.get("ageGroup") as string | null;
    const nicheInput = formData.get("niche") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 },
      );
    }

    const audience: AudienceTargeting = {
      country: countryInput,
      language: languageInput,
      ageGroup: ageGroupInput,
      niche: nicheInput,
    };

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const openai = getOpenAIClient();

    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Analyze this image and generate a viral hook, 5 captions, 20 hashtags, 3 content ideas, audience insights, and engagement recommendations for ${audience.niche} content targeting ${audience.ageGroup} ${audience.language}-speaking viewers in ${audience.country}.`,
      },
      {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
          detail: "high",
        },
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildImageAnalysisPrompt(audience) },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;

    if (!validateResult(parsed)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const insights = parseAudienceInsights(parsed);
    const viralScore = parseViralScore(parsed);

    return NextResponse.json({
      ...audience,
      viralHook: parsed.viralHook as string,
      captions: (parsed.captions as string[]).slice(0, 5),
      hashtags: (parsed.hashtags as string[])
        .slice(0, 20)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
      contentIdeas: (parsed.contentIdeas as string[]).slice(0, 3),
      ...insights,
      viralScore,
    } satisfies AnalysisResult);
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze media";
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
