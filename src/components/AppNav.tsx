"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Create", match: (p: string) => p === "/" },
  { href: "/studio", label: "Studio", match: (p: string) => p.startsWith("/studio") },
  { href: "/toolkit", label: "Toolkit", match: (p: string) => p.startsWith("/toolkit") },
  { href: "/sounds", label: "Sounds", match: (p: string) => p.startsWith("/sounds") },
  { href: "/calendar", label: "Calendar", match: (p: string) => p.startsWith("/calendar") },
  { href: "/growth", label: "Growth", match: (p: string) => p.startsWith("/growth") },
  { href: "/history", label: "History", match: (p: string) => p.startsWith("/history") },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex justify-center">
      <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1 scrollbar-hide">
        {NAV_ITEMS.map(({ href, label, match }) => {
          const isActive = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
