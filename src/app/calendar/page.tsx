"use client";

import { useCallback, useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { CopyButton } from "@/components/CopyButton";
import {
  deleteCalendarPost,
  formatCalendarDate,
  getCalendarPosts,
  getUpcomingReminders,
  markPostPosted,
  requestReminderPermission,
  saveCalendarPost,
  showDueReminders,
} from "@/lib/calendar";
import type { CalendarPost, CalendarPostStatus, Country, Niche } from "@/lib/types";
import { COUNTRIES, NICHES } from "@/lib/types";

export default function CalendarPage() {
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("18:00");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [country, setCountry] = useState<Country>("USA");
  const [niche, setNiche] = useState<Niche>("Lifestyle");
  const [filter, setFilter] = useState<CalendarPostStatus | "all">("all");

  const refresh = useCallback(() => setPosts(getCalendarPosts()), []);

  useEffect(() => {
    refresh();
    requestReminderPermission();
    showDueReminders();
    const interval = setInterval(showDueReminders, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleSave = useCallback(() => {
    if (!title.trim() || !scheduledDate) return;
    saveCalendarPost({
      title: title.trim(),
      caption: caption.trim(),
      hashtags: hashtags.split(/\s+/).filter(Boolean).map((h) => (h.startsWith("#") ? h : `#${h}`)),
      scheduledDate,
      scheduledTime,
      status: "scheduled",
      reminderEnabled,
      country,
      niche,
    });
    setTitle("");
    setCaption("");
    setHashtags("");
    setShowForm(false);
    refresh();
  }, [title, caption, hashtags, scheduledDate, scheduledTime, reminderEnabled, country, niche, refresh]);

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);
  const reminders = getUpcomingReminders();

  return (
    <PageLayout
      title="Content Calendar"
      subtitle="Schedule posts, track history, and get reminders"
      badge="Planner"
      wide
    >
      <main className="space-y-6">
        {reminders.length > 0 && (
          <div className="rounded-xl border border-[#fe2c55]/30 bg-[#fe2c55]/10 px-4 py-3 text-sm text-[#fe2c55]">
            🔔 {reminders.length} post{reminders.length > 1 ? "s" : ""} scheduled within 24 hours
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(["all", "scheduled", "posted", "draft"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                filter === f ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="ml-auto rounded-lg bg-gradient-to-r from-[#fe2c55] to-[#ff0050] px-4 py-1.5 text-xs font-semibold text-white"
          >
            + Schedule Post
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption"
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Hashtags (space separated)"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as Country)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value as Niche)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded"
              />
              Enable reminder notification
            </label>
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] py-3 text-sm font-semibold text-white"
            >
              Save to Calendar
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-white/40">
            No posts yet. Schedule your first post above.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => (
              <article key={post.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{post.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        post.status === "posted"
                          ? "bg-[#25f4ee]/20 text-[#25f4ee]"
                          : post.status === "scheduled"
                            ? "bg-[#fe2c55]/20 text-[#fe2c55]"
                            : "bg-white/10 text-white/50"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">
                      {formatCalendarDate(post.scheduledDate)}
                      {post.scheduledTime && ` at ${post.scheduledTime}`}
                      {post.postedAt && ` · Posted ${formatCalendarDate(post.postedAt)}`}
                    </p>
                  </div>
                  <CopyButton
                    text={`${post.caption}\n\n${post.hashtags.join(" ")}`}
                    label="Copy"
                    className="shrink-0 bg-white/10 text-white/70 hover:bg-white/15"
                  />
                </div>
                {post.caption && (
                  <p className="mb-2 line-clamp-2 text-sm text-white/70">{post.caption}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {post.status === "scheduled" && (
                    <button
                      type="button"
                      onClick={() => { markPostPosted(post.id); refresh(); }}
                      className="rounded-lg bg-[#25f4ee]/20 px-3 py-1 text-xs font-medium text-[#25f4ee]"
                    >
                      Mark as posted
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { deleteCalendarPost(post.id); refresh(); }}
                    className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
