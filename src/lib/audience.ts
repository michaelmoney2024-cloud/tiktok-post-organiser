import { COUNTRIES } from "@/lib/countries";

export const SUGGESTED_NICHES = [
  "Comedy",
  "Lifestyle",
  "Business",
  "Gaming",
  "Fashion",
  "Sports",
  "Music",
  "Food",
  "Travel",
  "Beauty",
  "Fitness",
  "Education",
  "Tech",
  "Dance",
  "Pets",
] as const;

export type SuggestedNiche = (typeof SUGGESTED_NICHES)[number];

const COUNTRY_GUIDANCE: Record<string, string> = {
  Nigeria:
    "Target Nigerian TikTok audiences. Use Naija-friendly tone where natural. Reference Nigerian culture, cities, Afrobeats, Nollywood, and local creator styles.",
  Canada:
    "Target Canadian TikTok audiences. Use Canadian cultural references, bilingual awareness where relevant, and Canadian lifestyle trends.",
  "United States":
    "Target US TikTok audiences. Use American pop culture references, US trending formats, and direct punchy delivery.",
  USA:
    "Target US TikTok audiences. Use American pop culture references, US trending formats, and direct punchy delivery.",
  "United Kingdom":
    "Target UK TikTok audiences. Use British humor, UK slang where natural, and UK TikTok trends.",
  UK:
    "Target UK TikTok audiences. Use British humor, UK slang where natural, and UK TikTok trends.",
  "South Africa":
    "Target South African TikTok audiences. Use Mzansi-friendly tone, local cultural references, and SA creator trends.",
};

const NICHE_GUIDANCE: Record<string, string> = {
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
  Food:
    "Food lens: recipes, taste reactions, plating, cooking hacks, and mouth-watering visuals.",
  Travel:
    "Travel lens: destinations, hidden gems, adventure energy, and wanderlust storytelling.",
  Beauty:
    "Beauty lens: tutorials, transformations, product reviews, and glam aesthetics.",
  Fitness:
    "Fitness lens: workouts, progress, motivation, form tips, and health goals.",
  Education:
    "Education lens: quick tips, explainers, how-tos, and value-packed knowledge drops.",
  Tech:
    "Tech lens: gadgets, reviews, tips, demos, and future-forward curiosity hooks.",
  Dance:
    "Dance lens: choreography, trends, rhythm, and high-energy movement.",
  Pets:
    "Pets lens: cute moments, funny animal behavior, pet care, and wholesome reactions.",
};

export function getCountryGuidance(country: string): string {
  return (
    COUNTRY_GUIDANCE[country] ??
    `Target TikTok audiences in ${country}. Use culturally relevant references, local trends, humor, and hashtags popular with ${country} viewers. Include country-specific discovery tags for ${country}.`
  );
}

export function getNicheGuidance(niche: string): string {
  return (
    NICHE_GUIDANCE[niche] ??
    `Frame all content through the "${niche}" niche lens. Use community-specific language, trends, and hashtags that ${niche} creators and audiences use on TikTok.`
  );
}

export function isValidCountry(value: unknown): value is string {
  return typeof value === "string" && COUNTRIES.includes(value);
}

export function isValidNiche(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 60;
}

export function normalizeNiche(value: string): string {
  return value.trim().slice(0, 60);
}
