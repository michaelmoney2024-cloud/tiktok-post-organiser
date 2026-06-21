import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  COUNTRIES,
  NICHES,
  type AnalysisResult,
  type Country,
  type Niche,
} from "@/lib/types";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const COUNTRY_GUIDANCE: Record<Country, string> = {
  Nigeria:
    "Target Nigerian TikTok audiences. Use Naija-friendly tone where natural (not forced). Reference Nigerian culture, cities (Lagos, Abuja, PH), Afrobeats, Nollywood, local humor, and trending Nigerian creator styles. Include Nigerian-specific hashtags like #NaijaTikTok, #NigerianTikTok, and relevant local tags.",
  Canada:
    "Target Canadian TikTok audiences. Use Canadian cultural references, bilingual awareness where relevant (English/French), Canadian humor (polite but witty), cities (Toronto, Vancouver, Montreal), and Canadian lifestyle trends. Include tags like #CanadaTikTok, #CanadianCreator, and region-relevant hashtags.",
  USA:
    "Target US TikTok audiences. Use American pop culture references, US trending formats, direct and punchy delivery, and mainstream US creator styles. Include US-relevant trending and niche hashtags popular on American TikTok.",
  UK:
    "Target UK TikTok audiences. Use British humor, UK slang where natural (not overdone), references to British culture, cities (London, Manchester, Birmingham), and UK TikTok trends. Include tags like #UKTikTok, #BritishTikTok, and UK-specific community hashtags.",
  "South Africa":
    "Target South African TikTok audiences. Use Mzansi-friendly tone, local cultural references, SA slang where natural, cities (Johannesburg, Cape Town, Durban), and South African creator trends. Include tags like #MzansiTikTok, #SouthAfricaTikTok, and local community hashtags.",
};

const NICHE_GUIDANCE: Record<Niche, string> = {
  Comedy:
    "Frame everything through a comedy lens: punchlines, relatable humor, skit-style hooks, meme references, and funny POV angles. Use comedic timing in hooks. Hashtags should include comedy community tags (#ComedyTikTok, #FunnyVideos, etc.) plus niche humor tags.",
  Lifestyle:
    "Frame content as lifestyle: daily routines, aesthetics, self-care, vlogs, relatable moments, and aspirational but authentic vibes. Hooks should feel personal and inviting. Use lifestyle hashtags (#LifestyleTikTok, #DayInMyLife, #Aesthetic, etc.).",
  Business:
    "Frame content for entrepreneurs and professionals: value-driven hooks, tips, behind-the-scenes, motivation, and actionable insights. Tone should be confident and credible, not salesy. Use business hashtags (#BusinessTikTok, #Entrepreneur, #SideHustle, etc.).",
  Gaming:
    "Frame content for gamers: hype moments, clutch plays, reactions, game references, streamer energy, and gaming culture. Hooks should build excitement or curiosity. Use gaming hashtags (#GamingTikTok, #Gamer, game-specific tags, etc.).",
  Fashion:
    "Frame content for fashion: outfit details, styling tips, trends, GRWM energy, and visual appeal. Hooks should highlight the look or style moment. Use fashion hashtags (#FashionTikTok, #OOTD, #StyleInspo, etc.).",
  Sports:
    "Frame content for sports fans: athletic moments, training, game day energy, highlights, and competitive spirit. Hooks should capture the adrenaline or achievement. Use sports hashtags (#SportsTikTok, #Athlete, sport-specific tags, etc.).",
  Music:
    "Frame content for music lovers: artist energy, performance vibes, sound trends, lyrical hooks, and musical moments. Hooks can reference beats, lyrics, or emotional connection to music. Use music hashtags (#MusicTikTok, #NewMusic, genre-specific tags, etc.).",
};

function buildSystemPrompt(country: Country, niche: Niche): string {
  return `You are a top-tier TikTok growth strategist who has helped ${niche} creators go viral in ${country}. Analyze the uploaded media and produce scroll-stopping, algorithm-friendly content for the ${niche} niche, specifically for a ${country} audience.

Study the image carefully: subject, mood, colors, setting, action, and how it fits the ${niche} niche. Tailor every output to what you actually see — never generic filler.

Country targeting (${country}):
${COUNTRY_GUIDANCE[country]}

Niche targeting (${niche}):
${NICHE_GUIDANCE[niche]}

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

function isValidCountry(value: string | null): value is Country {
  return COUNTRIES.includes(value as Country);
}

function isValidNiche(value: string | null): value is Niche {
  return NICHES.includes(value as Niche);
}

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
  const apiKey = process.env.OPENAI_API_KEY;
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
      return NextResponse.json({ error: "Invalid niche selected" }, { status: 400 });
    }

    const country = countryInput;
    const niche = nicheInput;

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
        { role: "system", content: buildSystemPrompt(country, niche) },
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
