import { AppLogo } from "./AppLogo";

interface AppHeaderProps {
  badge?: string;
  subtitle?: string;
  pageTitle?: string;
}

export function AppHeader({ badge, subtitle, pageTitle }: AppHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <div className="mb-4 flex justify-center">
        <AppLogo priority />
      </div>

      {badge && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25f4ee]" />
          {badge}
        </div>
      )}

      {pageTitle && (
        <h1 className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          {pageTitle}
        </h1>
      )}

      {subtitle && (
        <p className={`text-sm text-white/50 sm:text-base ${pageTitle ? "mt-2" : ""}`}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
