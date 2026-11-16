import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { SynopsisSection } from "@/components/landing/SynopsisSection";
import { ReaderHighlightsAndFaq } from "@/components/landing/ReaderHighlightsAndFaq";
import { Footer } from "@/components/landing/Footer";
import { SEO_KEYWORDS, SITE_NAME, SITE_URL, buildHomeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Read Reverend Insanity (RI) Online Free — All 2,334 Chapters",
  },
  description:
    "Read Reverend Insanity (RI / Gu Zhenren / 蛊真人) online free. Best ad-free web novel reader for all 2,334 chapters in English & Chinese raw, with bookmarks and EPUB download.",
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Read Reverend Insanity (RI) Online Free — All 2,334 Chapters",
    description:
      "Free, ad-free online reader for Gu Zhenren's Reverend Insanity (蛊真人). All 2,334 chapters in English and Chinese raw, customizable typography, and offline EPUB downloads.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Reverend Insanity (RI) by Gu Zhenren — Read all 2,334 chapters online free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Read Reverend Insanity (RI) Online Free — All 2,334 Chapters",
    description:
      "Best ad-free reader for Reverend Insanity (RI / Gu Zhenren): all 2,334 chapters online free in English & Chinese raw, plus EPUB downloads.",
    images: ["/opengraph-image"],
  },
};

export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const cookieStore = await cookies();
  const rawCookieEdition = cookieStore.get("reverend_reader_edition")?.value;
  const initialEdition: "en" | "zh" = rawCookieEdition === "zh" ? "zh" : "en";
  const lastReadRaw = cookieStore.get("reverend_last_read")?.value;
  const parsedLast = lastReadRaw ? parseInt(lastReadRaw, 10) : NaN;
  let continueChapter =
    !isNaN(parsedLast) && parsedLast >= 1 && parsedLast <= 2334 ? parsedLast : null;

  // Cross-device resume for signed-in readers when this device lacks a last-read cookie
  if (!continueChapter && cookieStore.getAll().some((c) => c.name.startsWith("sb-"))) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from("reading_progress")
          .select("chapter_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (
          progress &&
          typeof progress.chapter_id === "number" &&
          progress.chapter_id >= 1 &&
          progress.chapter_id <= 2334
        ) {
          continueChapter = progress.chapter_id;
        }
      }
    } catch {
      // Fall back to guest landing experience cleanly
    }
  }

  const jsonLd = buildHomeJsonLd(SITE_URL);

  return (
    <div className="relative flex min-h-screen flex-col text-ink font-sans selection:bg-accent/20">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navigation />

      <main id="main-content" className="flex-1">
        <HeroSection continueChapter={continueChapter} initialEdition={initialEdition} />
        <SynopsisSection />
        <ReaderHighlightsAndFaq />
      </main>

      <Footer />
    </div>
  );
}
