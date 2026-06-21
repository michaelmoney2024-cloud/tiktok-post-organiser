"use client";

import { useCallback, useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import {
  addGoal,
  addSnapshot,
  deleteGoal,
  deleteSnapshot,
  generateWeeklyReport,
  getFollowerGrowth,
  getGoalProgress,
  getGoals,
  getLatestSnapshot,
  getSnapshots,
} from "@/lib/growth";
import type { CreatorGoal, GrowthSnapshot, WeeklyReport } from "@/lib/types";

export default function GrowthPage() {
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>([]);
  const [goals, setGoals] = useState<CreatorGoal[]>([]);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("");
  const [posts, setPosts] = useState("");
  const [goalType, setGoalType] = useState<CreatorGoal["type"]>("followers");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  const refresh = useCallback(() => {
    setSnapshots(getSnapshots());
    setGoals(getGoals());
    setReport(generateWeeklyReport());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const latest = getLatestSnapshot();
  const totalGrowth = getFollowerGrowth();

  const handleLogMetrics = () => {
    if (!followers) return;
    addSnapshot(
      parseInt(followers, 10),
      parseFloat(engagement) || 0,
      parseInt(posts, 10) || 0,
    );
    setFollowers("");
    setEngagement("");
    setPosts("");
    refresh();
  };

  const handleAddGoal = () => {
    if (!goalTarget || !goalDeadline) return;
    addGoal(goalType, parseInt(goalTarget, 10), goalDeadline);
    setGoalTarget("");
    setGoalDeadline("");
    refresh();
  };

  return (
    <PageLayout
      title="Creator Growth"
      subtitle="Track followers, engagement, goals & weekly performance"
      badge="Analytics"
      wide
    >
      <main className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Followers" value={latest ? latest.followers.toLocaleString() : "—"} />
          <StatCard label="Engagement" value={latest ? `${latest.avgEngagement}%` : "—"} />
          <StatCard label="Total Growth" value={totalGrowth > 0 ? `+${totalGrowth}` : String(totalGrowth)} />
          <StatCard label="Posts Logged" value={latest ? String(latest.postsCount) : "—"} />
        </div>

        <section className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Log Metrics</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="Follower count"
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            <input
              type="number"
              step="0.1"
              value={engagement}
              onChange={(e) => setEngagement(e.target.value)}
              placeholder="Avg engagement %"
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            <input
              type="number"
              value={posts}
              onChange={(e) => setPosts(e.target.value)}
              placeholder="Posts this week"
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
          </div>
          <button
            type="button"
            onClick={handleLogMetrics}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-3 text-sm font-semibold text-white"
          >
            Save Snapshot
          </button>
        </section>

        {snapshots.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Follower Growth</h3>
            <div className="flex items-end gap-1 h-24">
              {snapshots.slice(-14).map((s) => {
                const max = Math.max(...snapshots.map((x) => x.followers));
                const height = max > 0 ? (s.followers / max) * 100 : 0;
                return (
                  <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#fe2c55] to-[#25f4ee]"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                    />
                    <span className="text-[8px] text-white/30">{s.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Set Goal</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as CreatorGoal["type"])}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="followers">Followers</option>
              <option value="engagement">Engagement %</option>
              <option value="posts">Total Posts</option>
            </select>
            <input
              type="number"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              placeholder="Target"
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            <input
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="button"
            onClick={handleAddGoal}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            Add Goal
          </button>

          {goals.length > 0 && (
            <div className="mt-4 space-y-3">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const pct = goal.target > 0 ? Math.min(100, (progress / goal.target) * 100) : 0;
                return (
                  <div key={goal.id} className="rounded-lg border border-white/5 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-white">
                        {goal.type}: {progress.toLocaleString()} / {goal.target.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => { deleteGoal(goal.id); refresh(); }}
                        className="text-xs text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#fe2c55] to-[#25f4ee]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/40">Deadline: {goal.deadline}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {report && (
          <section className="rounded-xl border border-[#25f4ee]/20 bg-gradient-to-br from-[#25f4ee]/10 to-transparent p-4 sm:p-5">
            <h3 className="mb-1 text-sm font-semibold text-white">Weekly Performance Report</h3>
            <p className="mb-4 text-xs text-white/40">
              {report.weekStart} → {report.weekEnd}
            </p>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Published" value={String(report.postsPublished)} />
              <MiniStat label="Scheduled" value={String(report.postsScheduled)} />
              <MiniStat label="Follower Δ" value={report.followerChange > 0 ? `+${report.followerChange}` : String(report.followerChange)} />
              <MiniStat label="Top Niche" value={report.topNiche} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-white/50">Highlights</h4>
                <ul className="space-y-1">
                  {report.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-white/80">✓ {h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-white/50">Recommendations</h4>
                <ul className="space-y-1">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-white/80">→ {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {snapshots.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">History</h3>
            <div className="space-y-2">
              {[...snapshots].reverse().map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm">
                  <span className="text-white/60">{s.date}</span>
                  <span className="text-white">{s.followers.toLocaleString()} followers · {s.avgEngagement}% eng.</span>
                  <button
                    type="button"
                    onClick={() => { deleteSnapshot(s.id); refresh(); }}
                    className="text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </PageLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/20 p-2 text-center">
      <p className="text-sm font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </div>
  );
}
