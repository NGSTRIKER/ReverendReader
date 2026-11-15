import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { SynopsisSection } from "@/components/landing/SynopsisSection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reverend-reader.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Reverend Reader",
        description: "Online reader for Reverend Insanity by Gu Zhenren.",
        inLanguage: "en-US",
      },
      {
        "@type": "Book",
        "@id": `${siteUrl}/#book`,
        name: "Reverend Insanity",
        alternateName: ["Gu Zhenren", "蛊真人", "Master of Gu"],
        author: {
          "@type": "Person",
          name: "Gu Zhenren",
          alternateName: "蛊真人",
        },
        genre: ["Dark Fantasy", "Xianxia", "Cultivation", "Philosophical Fiction"],
        numberOfPages: 2334,
        inLanguage: "en",
        description:
          "Humans are the spirit of all living beings, Gu are the essence of heaven and earth. Follow Fang Yuan's five-hundred-year return through the world of Gu cultivation.",
      },
    ],
  };

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
      </main>

      <Footer />
    </div>
  );
}
