import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { SynopsisSection } from "@/components/landing/SynopsisSection";
import { ThemesSection } from "@/components/landing/ThemesSection";
import { ArtworkSection } from "@/components/landing/ArtworkSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reverend-reader.local";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Reverend Insanity Reader",
        description: "Distraction-free, high performance novel reader for Reverend Insanity by Gu Zhen Ren.",
        inLanguage: "en-US",
      },
      {
        "@type": "Book",
        "@id": `${siteUrl}/#book`,
        name: "Reverend Insanity (Daoist Gu / 蛊真人)",
        alternateName: ["Daoist Gu", "Gu Zhen Ren", "Master of Gu"],
        author: {
          "@type": "Person",
          name: "Gu Zhen Ren",
          alternateName: "蛊真人",
        },
        genre: ["Dark Fantasy", "Xianxia", "Cultivation", "Philosophical Fiction"],
        numberOfPages: 2334,
        inLanguage: "en",
        description:
          "The story of Fang Yuan who was reborn 500 years into the past with the Spring Autumn Cicada, embarking on an unrelenting pursuit of eternal life through Gu refinement.",
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#1e1e2e] text-[#cdd6f4]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navigation />

      <main className="flex-1">
        <HeroSection />
        <SynopsisSection />
        <ThemesSection />
        <ArtworkSection />
      </main>

      <Footer />
    </div>
  );
}
