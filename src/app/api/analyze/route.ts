import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { isValidCountry, isValidNiche, normalizeNiche } from "@/lib/audience";
import { buildImageAnalysisPrompt } from "@/lib/ai/prompts";
import type { AnalysisResult, Country, Niche } from "@/lib/types";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function validateResult(data: unknown): data is Omit<AnalysisResult, "country" | "niche"> {
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
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mediaType = formData.get("mediaType") as string | null;
    const countryInput = formData.get("country") as string | null;
    const nicheInput = formData.get("niche") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isValidCountry(countryInput)) {
      return NextResponse.json({ error: "Invalid country selected" }, { status: 400 });
    }

    if (!isValidNiche(nicheInput)) {
      return NextResponse.json(
        { error: "Please enter a content niche (2–60 characters)" },
        { status: 400 },
      );
    }

    const country = countryInput as Country;
    const niche = normalizeNiche(nicheInput) as Niche;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const openai = new OpenAI({ apiKey });

    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text:
          mediaType === "video"
            ? `This image is a frame extracted from a TikTok video. Analyze it and generate a viral hook, 5 viral captions, 20 hashtags, and 3 content ideas tailored for ${niche} content in ${country}.`
            : `Analyze this image and generate a viral hook, 5 viral captions, 20 hashtags, and 3 content ideas for ${niche} TikTok content, tailored for a ${country} audience.`,
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
        { role: "system", content: buildImageAnalysisPrompt(country, niche) },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(content);

    if (!validateResult(parsed)) {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      country,
      niche,
      viralHook: parsed.viralHook,
      captions: parsed.captions.slice(0, 5),
      hashtags: parsed.hashtags.slice(0, 20).map((tag) =>
        tag.startsWith("#") ? tag : `#${tag}`,
      ),
      contentIdeas: parsed.contentIdeas.slice(0, 3),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
