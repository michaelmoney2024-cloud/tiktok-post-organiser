"use client";

import { AppNav } from "./AppNav";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  badge?: string;
  wide?: boolean;
  children: React.ReactNode;
}

export function PageLayout({ title, subtitle, badge, wide, children }: PageLayoutProps) {
  return (
    <div className="min-h-full bg-[#0f0f0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#fe2c55]/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#25f4ee]/15 blur-[100px]" />
      </div>

      <div
        className={`relative mx-auto px-4 py-8 sm:px-6 sm:py-12 ${
          wide ? "max-w-4xl" : "max-w-lg sm:max-w-xl"
        }`}
      >
        <header className="mb-8 text-center">
          {badge && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25f4ee]" />
              {badge}
            </div>
          )}
          <h1 className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-white/50 sm:text-base">{subtitle}</p>
          )}
        </header>

        <AppNav />
        {children}
      </div>
    </div>
  );
}
