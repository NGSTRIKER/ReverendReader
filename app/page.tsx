import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
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
  const lastReadRaw = cookieStore.get("reverend_last_read")?.value;
  const parsedLast = lastReadRaw ? parseInt(lastReadRaw, 10) : NaN;
  const continueChapter =
    !isNaN(parsedLast) && parsedLast >= 1 && parsedLast <= 2334 ? parsedLast : null;

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
    <div className="flex min-h-screen flex-col bg-paper text-ink font-mono selection:bg-accent/20">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navigation />

      <main className="flex-1">
        <HeroSection continueChapter={continueChapter} />
        <SynopsisSection />
      </main>

      <Footer />
    </div>
  );
}
