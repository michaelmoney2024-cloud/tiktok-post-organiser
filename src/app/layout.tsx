import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TikTok Post Organizer",
  description:
    "Upload images or videos and get AI-generated TikTok captions, hashtags, and content ideas.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "TikTok Post Organizer",
    description:
      "Upload images or videos and get AI-generated TikTok captions, hashtags, and content ideas.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "TikTok Post Organizer" }],
  },
  twitter: {
    card: "summary",
    title: "TikTok Post Organizer",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
