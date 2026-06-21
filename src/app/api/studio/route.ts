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
  type StudioResult,
} from "@/lib/types";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildStudioPrompt } from "@/lib/ai/prompts";

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
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 20MB." }, { status: 400 });
    }

    const countryInput = formData.get("country") as string | null;
    const languageInput = formData.get("language") as string | null;
    const ageGroupInput = formData.get("ageGroup") as string | null;
    const nicheInput = formData.get("niche") as string | null;

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const openai = getOpenAIClient();
    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Generate platform-specific content for all major social platforms targeting ${audience.ageGroup} ${audience.language}-speaking ${audience.niche} audience in ${audience.country}.`,
      },
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildStudioPrompt(audience) },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No AI response" }, { status: 500 });

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const fields = [
      "tiktokCaption", "instagramCaption", "youtubeShortsTitle",
      "youtubeDescription", "twitterPost", "facebookPost", "linkedinPost",
    ] as const;

    for (const f of fields) {
      if (typeof parsed[f] !== "string") {
        return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
      }
    }

    return NextResponse.json({
      country: audience.country,
      language: audience.language,
      niche: audience.niche,
      tiktokCaption: parsed.tiktokCaption as string,
      instagramCaption: parsed.instagramCaption as string,
      youtubeShortsTitle: parsed.youtubeShortsTitle as string,
      youtubeDescription: parsed.youtubeDescription as string,
      twitterPost: parsed.twitterPost as string,
      facebookPost: parsed.facebookPost as string,
      linkedinPost: parsed.linkedinPost as string,
    } satisfies StudioResult);
  } catch (error) {
    console.error("Studio error:", error);
    const message = error instanceof Error ? error.message : "Studio generation failed";
    if (message.includes("API key")) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
