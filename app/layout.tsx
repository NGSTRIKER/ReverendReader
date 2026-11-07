import type { Metadata, Viewport } from "next";
import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { THEME_COOKIE, parseThemeCookie } from "@/lib/theme";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reverend-reader.vercel.app";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Reverend Insanity by Gu Zhenren | Read Online",
    template: "%s | Reverend Reader",
  },
  description:
    "Read Reverend Insanity by Gu Zhenren (蛊真人) online. All 2,334 chapters of Fang Yuan's story in a quiet, fast reader with bookmarks and synced progress.",
  keywords: [
    "Reverend Insanity",
    "Gu Zhenren",
    "蛊真人",
    "Fang Yuan",
    "Cultivation Novel",
    "Dark Fantasy",
    "Xianxia",
    "Web Novel Reader",
  ],
  authors: [{ name: "Gu Zhenren" }],
  creator: "Reverend Reader",
  applicationName: "Reverend Reader",
  openGraph: {
    title: "Reverend Insanity, read online",
    description:
      "All 2,334 chapters of Gu Zhenren's Reverend Insanity in a quiet reader with adjustable type, bookmarks and synced progress.",
    url: siteUrl,
    siteName: "Reverend Reader",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reverend Insanity, read online",
    description: "A fast, quiet reader for Gu Zhenren's Reverend Insanity.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = parseThemeCookie((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${ebGaramond.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
