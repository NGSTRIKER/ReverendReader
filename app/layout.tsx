import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reverend-reader.vercel.app";

export const viewport: Viewport = {
  themeColor: "#1e1e2e",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Reverend Insanity | Masterpiece Dark Fantasy Cultivation Novel",
    template: "%s | Reverend Insanity Reader",
  },
  description:
    "An uncompromised reading experience for Reverend Insanity by Gu Zhenren (蛊真人). Follow Fang Yuan's 500-year rebirth through a ruthless world of Gu cultivation.",
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
  openGraph: {
    title: "Reverend Insanity Reader — The Eternal Journey",
    description:
      "Experience Reverend Insanity with an immaculate, distraction-free reading interface featuring customizable typography, fast chapter streaming, and custom themes.",
    url: siteUrl,
    siteName: "Reverend Insanity Reader",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reverend Insanity Reader",
    description:
      "A fast, distraction-free reading interface for the literary dark fantasy classic Reverend Insanity.",
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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="canonical" href={siteUrl} />
      </head>
      <body className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] selection:bg-[#89b4fa]/30 selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
