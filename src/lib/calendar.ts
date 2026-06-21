import type { CalendarPost, CalendarPostStatus } from "./types";

const STORAGE_KEY = "tiktok-calendar-posts";

function read(): CalendarPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CalendarPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(posts: CalendarPost[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getCalendarPosts(): CalendarPost[] {
  return read().sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
  );
}

export function saveCalendarPost(post: Omit<CalendarPost, "id" | "createdAt">): CalendarPost {
  const entry: CalendarPost = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  write([entry, ...read()]);
  return entry;
}

export function updateCalendarPost(id: string, updates: Partial<CalendarPost>): void {
  write(read().map((p) => (p.id === id ? { ...p, ...updates } : p)));
}

export function deleteCalendarPost(id: string): void {
  write(read().filter((p) => p.id !== id));
}

export function markPostPosted(id: string): void {
  updateCalendarPost(id, { status: "posted", postedAt: new Date().toISOString() });
}

export function getPostsByStatus(status: CalendarPostStatus): CalendarPost[] {
  return getCalendarPosts().filter((p) => p.status === status);
}

export function getUpcomingReminders(): CalendarPost[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getCalendarPosts().filter((p) => {
    if (!p.reminderEnabled || p.status === "posted") return false;
    const scheduled = new Date(p.scheduledDate);
    return scheduled >= now && scheduled <= tomorrow;
  });
}

export function requestReminderPermission(): void {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function showDueReminders(): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  for (const post of getCalendarPosts()) {
    if (!post.reminderEnabled || post.status === "posted") continue;
    const scheduled = new Date(`${post.scheduledDate}T${post.scheduledTime ?? "09:00"}`);
    const diff = scheduled.getTime() - now.getTime();
    if (diff >= 0 && diff <= 3600000) {
      new Notification("Post reminder", {
        body: `"${post.title}" is scheduled soon`,
        tag: post.id,
      });
    }
  }
}

export function formatCalendarDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
