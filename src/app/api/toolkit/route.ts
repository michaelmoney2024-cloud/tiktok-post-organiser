import { NextRequest, NextResponse } from "next/server";
import {
  COUNTRIES,
  NICHES,
  TOOLKIT_TOOLS,
  type Country,
  type Niche,
  type PostingTimeRecommendation,
  type ToolkitResult,
  type ToolkitTool,
} from "@/lib/types";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildToolkitPrompt } from "@/lib/ai/prompts";

function isValidCountry(value: unknown): value is Country {
  return typeof value === "string" && COUNTRIES.includes(value as Country);
}

function isValidNiche(value: unknown): value is Niche {
  return typeof value === "string" && NICHES.includes(value as Niche);
}

function isValidTool(value: unknown): value is ToolkitTool {
  return typeof value === "string" && TOOLKIT_TOOLS.includes(value as ToolkitTool);
}

function validateItems(data: Record<string, unknown>, min = 1): string[] | null {
  if (!Array.isArray(data.items)) return null;
  const items = data.items.filter((i) => typeof i === "string") as string[];
  return items.length >= min ? items : null;
}

function validateRecommendations(
  data: Record<string, unknown>,
): PostingTimeRecommendation[] | null {
  if (!Array.isArray(data.recommendations)) return null;
  const recs: PostingTimeRecommendation[] = [];
  for (const r of data.recommendations) {
    if (!r || typeof r !== "object") return null;
    const rec = r as Record<string, unknown>;
    if (typeof rec.day !== "string" || typeof rec.reason !== "string") return null;
    if (!Array.isArray(rec.times) || !rec.times.every((t) => typeof t === "string")) return null;
    recs.push({ day: rec.day, times: rec.times as string[], reason: rec.reason });
  }
  return recs.length >= 5 ? recs : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, country, niche, topic = "" } = body;

    if (!isValidTool(tool)) {
      return NextResponse.json({ error: "Invalid tool selected" }, { status: 400 });
    }
    if (!isValidCountry(country)) {
      return NextResponse.json({ error: "Invalid country selected" }, { status: 400 });
    }
    if (!isValidNiche(niche)) {
      return NextResponse.json({ error: "Invalid niche selected" }, { status: 400 });
    }
    if (tool !== "posting-times" && typeof topic === "string" && topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Please describe your content topic" },
        { status: 400 },
      );
    }

    const openai = getOpenAIClient();
    const prompt = buildToolkitPrompt(tool, country, niche, topic.trim());

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a TikTok growth expert. Always respond with valid JSON only, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const result: ToolkitResult = {
      tool,
      country,
      niche,
      topic: topic.trim(),
    };

    if (tool === "posting-times") {
      const recommendations = validateRecommendations(parsed);
      if (!recommendations) {
        return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
      }
      result.recommendations = recommendations;
    } else {
      const minItems = tool === "content-ideas" ? 5 : tool === "hashtags" ? 15 : 3;
      const items = validateItems(parsed, minItems);
      if (!items) {
        return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
      }
      if (tool === "hashtags") {
        result.items = items.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
      } else {
        result.items = items;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Toolkit error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate content";
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
