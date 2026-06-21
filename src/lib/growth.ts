import type { CreatorGoal, GrowthSnapshot, WeeklyReport } from "./types";
import { getCalendarPosts } from "./calendar";

const SNAPSHOTS_KEY = "tiktok-growth-snapshots";
const GOALS_KEY = "tiktok-creator-goals";

function readSnapshots(): GrowthSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GrowthSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readGoals(): CreatorGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreatorGoal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSnapshots(): GrowthSnapshot[] {
  return readSnapshots().sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function addSnapshot(followers: number, avgEngagement: number, postsCount: number): GrowthSnapshot {
  const entry: GrowthSnapshot = {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    followers,
    avgEngagement,
    postsCount,
  };
  const snapshots = [...readSnapshots(), entry];
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  return entry;
}

export function deleteSnapshot(id: string): void {
  localStorage.setItem(
    SNAPSHOTS_KEY,
    JSON.stringify(readSnapshots().filter((s) => s.id !== id)),
  );
}

export function getGoals(): CreatorGoal[] {
  return readGoals();
}

export function addGoal(type: CreatorGoal["type"], target: number, deadline: string): CreatorGoal {
  const entry: CreatorGoal = {
    id: crypto.randomUUID(),
    type,
    target,
    deadline,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(GOALS_KEY, JSON.stringify([entry, ...readGoals()]));
  return entry;
}

export function deleteGoal(id: string): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(readGoals().filter((g) => g.id !== id)));
}

export function getLatestSnapshot(): GrowthSnapshot | null {
  const snapshots = getSnapshots();
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function getFollowerGrowth(): number {
  const snapshots = getSnapshots();
  if (snapshots.length < 2) return 0;
  return snapshots[snapshots.length - 1].followers - snapshots[0].followers;
}

export function generateWeeklyReport(): WeeklyReport {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const posts = getCalendarPosts();
  const weekPosts = posts.filter((p) => new Date(p.createdAt) >= weekStart);
  const published = weekPosts.filter((p) => p.status === "posted");
  const scheduled = weekPosts.filter((p) => p.status === "scheduled");

  const snapshots = getSnapshots().filter((s) => new Date(s.date) >= weekStart);
  const followerChange =
    snapshots.length >= 2
      ? snapshots[snapshots.length - 1].followers - snapshots[0].followers
      : 0;
  const avgEngagement =
    snapshots.length > 0
      ? snapshots.reduce((sum, s) => sum + s.avgEngagement, 0) / snapshots.length
      : 0;

  const nicheCounts: Record<string, number> = {};
  for (const p of weekPosts) {
    if (p.niche) nicheCounts[p.niche] = (nicheCounts[p.niche] ?? 0) + 1;
  }
  const topNiche =
    Object.entries(nicheCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

  const highlights: string[] = [];
  if (published.length > 0) highlights.push(`Published ${published.length} posts this week`);
  if (followerChange > 0) highlights.push(`Gained ${followerChange} followers`);
  if (avgEngagement > 0) highlights.push(`Average engagement: ${avgEngagement.toFixed(1)}%`);
  if (highlights.length === 0) highlights.push("Start logging metrics to see weekly highlights");

  const recommendations: string[] = [];
  if (scheduled.length === 0) recommendations.push("Schedule posts in the Content Calendar");
  if (snapshots.length === 0) recommendations.push("Log follower count weekly to track growth");
  if (published.length < 3) recommendations.push("Aim for 3+ posts per week for algorithm boost");
  recommendations.push("Use the AI Studio to repurpose content across platforms");

  return {
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: now.toISOString().split("T")[0],
    postsScheduled: scheduled.length,
    postsPublished: published.length,
    followerChange,
    avgEngagement,
    topNiche,
    highlights,
    recommendations,
  };
}

export function getGoalProgress(goal: CreatorGoal): number {
  const latest = getLatestSnapshot();
  const posts = getCalendarPosts().filter((p) => p.status === "posted");

  switch (goal.type) {
    case "followers":
      return latest?.followers ?? 0;
    case "engagement":
      return latest?.avgEngagement ?? 0;
    case "posts":
      return posts.length;
  }
}
