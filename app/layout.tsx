import type { Metadata, Viewport } from "next";
import { Bellota, DM_Sans, EB_Garamond, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { THEME_COOKIE, parseThemeCookie } from "@/lib/theme";
import { SEO_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const siteUrl = SITE_URL;

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-mono",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-sans",
});

const bellota = Bellota({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bellota",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Read Reverend Insanity (RI) Online Free | Gu Zhenren",
    template: "%s | Reverend Reader",
  },
  description:
    "Read Reverend Insanity (RI / Gu Zhenren / 蛊真人) online free. Best ad-free web novel reader for all 2,334 chapters in English and Chinese raw, with EPUB download and synced bookmarks.",
  keywords: SEO_KEYWORDS,
  authors: [{ name: "Gu Zhenren" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: "Books & Literature",
  classification: "Web Novel, Xianxia, Dark Fantasy, Cultivation Fiction",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Read Reverend Insanity (RI) Online Free — All 2,334 Chapters",
    description:
      "Free, ad-free reader for all 2,334 chapters of Gu Zhenren's Reverend Insanity (蛊真人) in English and Chinese raw, with adjustable typography, bookmarks, and EPUB downloads.",
    url: siteUrl,
    siteName: SITE_NAME,
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Reverend Insanity (RI) by Gu Zhenren — Read all 2,334 chapters online free",
      },
      {
        url: "/images/book-cover.jpg",
        width: 800,
        height: 1170,
        alt: "Reverend Insanity book cover featuring Fang Yuan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Read Reverend Insanity (RI) Online Free — All 2,334 Chapters",
    description:
      "Best ad-free reader for Gu Zhenren's Reverend Insanity (蛊真人): all 2,334 chapters online free in English & Chinese raw, plus EPUB downloads.",
    images: ["/opengraph-image"],
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
  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE)?.value);
  const rawEdition = cookieStore.get("reverend_reader_edition")?.value;
  const htmlLang = rawEdition === "zh" ? "zh-Hans" : "en";

  return (
    <html
      lang={htmlLang}
      data-theme={theme}
      className={`${ebGaramond.variable} ${jetbrainsMono.variable} ${dmSans.variable} ${bellota.variable}`}
    >
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
