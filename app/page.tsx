import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { SynopsisSection } from "@/components/landing/SynopsisSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reverend-reader.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Reverend Insanity Reader",
        description: "Distraction-free, high performance novel reader for Reverend Insanity by Gu Zhenren.",
        inLanguage: "en-US",
      },
      {
        "@type": "Book",
        "@id": `${siteUrl}/#book`,
        name: "Reverend Insanity (蛊真人)",
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
          "Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth. Follow Fang Yuan's 500-year rebirth through a ruthless world of Gu cultivation.",
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#181825] text-[#cdd6f4]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navigation />

      <main className="flex-1">
        <HeroSection />
        <SynopsisSection />
      </main>

      <Footer />
    </div>
  );
}
