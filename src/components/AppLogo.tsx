import Image from "next/image";
import Link from "next/link";

export const LOGO_SIZE = 80;

interface AppLogoProps {
  href?: string;
  className?: string;
  priority?: boolean;
}

export function AppLogo({
  href = "/",
  className = "",
  priority = false,
}: AppLogoProps) {
  const image = (
    <Image
      src="/logo.png"
      alt="TikTok Post Organizer"
      width={LOGO_SIZE}
      height={LOGO_SIZE}
      priority={priority}
      className={`rounded-2xl shadow-lg shadow-black/50 ring-1 ring-white/10 ${className}`}
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-block transition hover:scale-[1.02] active:scale-[0.98]">
      {image}
    </Link>
  );
}
