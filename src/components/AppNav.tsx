"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Create", icon: CreateIcon, match: (p: string) => p === "/" },
  { href: "/toolkit", label: "Toolkit", icon: ToolkitIcon, match: (p: string) => p.startsWith("/toolkit") },
  { href: "/history", label: "History", icon: HistoryIcon, match: (p: string) => p.startsWith("/history") },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex justify-center">
      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const isActive = match(pathname);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function CreateIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ToolkitIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}
