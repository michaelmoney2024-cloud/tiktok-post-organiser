import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import {
  AGE_GROUPS,
  COUNTRIES,
  LANGUAGES,
  NICHES,
  type AgeGroup,
  type AudienceTargeting,
  type Country,
  type Language,
  type Niche,
  type TrendingSoundsResult,
  type TrendingSound,
} from "@/lib/types";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildTrendingSoundsPrompt } from "@/lib/ai/prompts";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function isValidCountry(v: string | null): v is Country {
  return typeof v === "string" && COUNTRIES.includes(v as Country);
}
function isValidLanguage(v: string | null): v is Language {
  return typeof v === "string" && LANGUAGES.includes(v as Language);
}
function isValidAgeGroup(v: string | null): v is AgeGroup {
  return typeof v === "string" && AGE_GROUPS.includes(v as AgeGroup);
}
function isValidNiche(v: string | null): v is Niche {
  return typeof v === "string" && NICHES.includes(v as Niche);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const countryInput = formData.get("country") as string | null;
    const languageInput = formData.get("language") as string | null;
    const ageGroupInput = formData.get("ageGroup") as string | null;
    const nicheInput = formData.get("niche") as string | null;
    const topic = (formData.get("topic") as string | null) ?? "";
    const file = formData.get("file") as File | null;

    if (!isValidCountry(countryInput) || !isValidLanguage(languageInput) ||
        !isValidAgeGroup(ageGroupInput) || !isValidNiche(nicheInput)) {
      return NextResponse.json({ error: "Invalid audience targeting" }, { status: 400 });
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
        text: topic
          ? `Content topic: ${topic}. Suggest trending sounds for ${audience.country}.`
          : `Suggest trending sounds for ${audience.niche} content in ${audience.country}.`,
      },
    ];

    if (file && file.size <= MAX_FILE_SIZE) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64}`, detail: "low" },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildTrendingSoundsPrompt(audience, topic) },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No AI response" }, { status: 500 });

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const sounds = Array.isArray(parsed.sounds) ? parsed.sounds : [];
    const validSounds: TrendingSound[] = [];

    for (const s of sounds) {
      if (!s || typeof s !== "object") continue;
      const item = s as Record<string, unknown>;
      if (
        typeof item.name === "string" &&
        typeof item.category === "string" &&
        typeof item.style === "string" &&
        typeof item.whyItFits === "string" &&
        typeof item.usageTip === "string"
      ) {
        validSounds.push({
          name: item.name,
          category: item.category,
          style: item.style,
          whyItFits: item.whyItFits,
          usageTip: item.usageTip,
        });
      }
    }

    if (validSounds.length === 0) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    return NextResponse.json({
      country: audience.country,
      niche: audience.niche,
      audioCategories: Array.isArray(parsed.audioCategories)
        ? (parsed.audioCategories as unknown[]).filter((c) => typeof c === "string") as string[]
        : [],
      musicStyles: Array.isArray(parsed.musicStyles)
        ? (parsed.musicStyles as unknown[]).filter((c) => typeof c === "string") as string[]
        : [],
      sounds: validSounds.slice(0, 8),
    } satisfies TrendingSoundsResult);
  } catch (error) {
    console.error("Trending sounds error:", error);
    const message = error instanceof Error ? error.message : "Failed to get sound suggestions";
    if (message.includes("API key")) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
