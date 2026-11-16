export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://reverend-reader.vercel.app";

export const SITE_NAME = "Reverend Reader";
export const NOVEL_TITLE = "Reverend Insanity";
export const NOVEL_CHAPTER_COUNT = 2334;

/**
 * High-intent search keywords covering Reverend Insanity (RI), Gu Zhenren,
 * free online reading queries, genre discovery, formats, and core novel lore.
 */
export const SEO_KEYWORDS: string[] = [
  "Reverend Insanity",
  "RI",
  "read Reverend Insanity",
  "read Reverend Insanity online",
  "read Reverend Insanity online free",
  "Reverend Insanity free",
  "read RI online",
  "read RI free",
  "RI novel",
  "RI novel online",
  "best Reverend Insanity reader",
  "best web novel",
  "best xianxia novel",
  "best cultivation novel",
  "best dark fantasy web novel",
  "best villain protagonist novel",
  "best light novel online",
  "Reverend Reader",
  "Gu Zhenren",
  "Gu Zhen Ren",
  "蛊真人",
  "蛊真人小说",
  "蛊真人在线阅读",
  "蛊真人全文免费阅读",
  "Master of Gu",
  "Daoist Gu",
  "Fang Yuan",
  "Fang Yuan novel",
  "Great Love Immortal Venerable",
  "Heaven Refining Demon Venerable",
  "Reverend Insanity all chapters",
  "Reverend Insanity 2334 chapters",
  "Reverend Insanity complete chapters",
  "Reverend Insanity chapter 1",
  "Reverend Insanity English translation",
  "Reverend Insanity Chinese raw",
  "Reverend Insanity epub",
  "Reverend Insanity epub download",
  "Reverend Insanity free download",
  "Reverend Insanity pdf alternative",
  "read web novel online free",
  "read light novel online free",
  "ad-free web novel reader",
  "free online novel reader",
  "xianxia",
  "xianxia novel",
  "xuanhuan",
  "cultivation novel",
  "dark fantasy",
  "progression fantasy",
  "philosophical fantasy",
  "reincarnation novel",
  "regression novel",
  "time travel cultivation",
  "antihero web novel",
  "villain MC novel",
  "smart protagonist novel",
  "translated Chinese web novel",
  "Chinese light novel",
  "Spring Autumn Cicada",
  "Gu Master",
  "Gu Immortal",
  "Five Regions Nine Heavens",
  "Qing Mao Mountain",
  "Gu Yue Clan",
  "Three Kings Inheritance",
  "Hu Immortal Blessed Land",
  "Yi Tian Mountain",
  "Crazed Demon Cave",
  "Bai Ning Bing",
  "Spectral Soul Demon Venerable",
  "Red Lotus Demon Venerable",
  "Fate Gu",
  "Ren Zu",
  "The Legends of Ren Zu",
];

/**
 * Visible editorial discovery tags rendered on the main page.
 */
export const NOVEL_DISCOVERY_TAGS: readonly { label: string; href: string }[] = [
  { label: "Reverend Insanity (RI)", href: "/read?c=1" },
  { label: "Read Online Free", href: "/read" },
  { label: "Gu Zhenren · 蛊真人", href: "/read?edition=zh" },
  { label: "Master of Gu", href: "/#synopsis" },
  { label: "Best Xianxia Novel", href: "/#faq" },
  { label: "Dark Fantasy & Cultivation", href: "/#synopsis" },
  { label: "Regression & Time Travel", href: "/read?c=1" },
  { label: "Villain Protagonist", href: "/#synopsis" },
  { label: "Fang Yuan", href: "/#synopsis" },
  { label: "Spring Autumn Cicada", href: "/read?c=1" },
  { label: "Gu Master & Gu Immortal", href: "/#volumes" },
  { label: "Five Regions · Nine Heavens", href: "/#volumes" },
  { label: "The Legends of Ren Zu", href: "/read?toc=1" },
  { label: "All 2,334 Chapters", href: "/read?toc=1" },
  { label: "Ad-Free Web Novel Reader", href: "/read" },
  { label: "English & Chinese Raw", href: "/read?edition=zh" },
  { label: "Free EPUB Download", href: "/downloads/Reverend_Insanity.epub" },
  { label: "Xuanhuan & Progression", href: "/#volumes" },
];

export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: readonly FaqEntry[] = [
  {
    question: "Where can I read Reverend Insanity (RI) online for free?",
    answer:
      "You can read all 2,334 chapters of Reverend Insanity (RI) online for free right here on Reverend Reader with zero ads, no paywalls, and no account required. Open the reader to start from Chapter 1 or jump to any volume.",
  },
  {
    question: "How many chapters does Reverend Insanity have?",
    answer:
      "Reverend Insanity by Gu Zhenren (蛊真人) spans 2,334 translated chapters and approximately 4.86 million words across six major volumes, from Qing Mao Mountain to the Crazed Demon Cave. Both the complete English translation and the original 2,334-chapter Chinese raw edition are available.",
  },
  {
    question: "Why is Reverend Insanity considered one of the best web novels?",
    answer:
      "Readers widely regard Reverend Insanity as one of the best xianxia and dark fantasy web novels for its intricate Gu cultivation system, philosophical parables (The Legends of Ren Zu), multi-layered schemes across the Five Regions, and Fang Yuan—an uncompromising, rational protagonist pursuing eternal life.",
  },
  {
    question: "Can I download Reverend Insanity as a free EPUB for offline reading?",
    answer:
      "Yes. Reverend Reader provides direct, free offline EPUB downloads for both the complete 2,334-chapter English edition (25 MB) and the original Chinese raw edition Gu Zhen Ren (19 MB), accessible from the hero panel and footer.",
  },
  {
    question: "Do I need an account to save my chapter progress and bookmarks?",
    answer:
      "No account is required. Reading progress, chapter position, and reader typography settings (font, size, spacing, light/dark themes) save automatically on your device. Signing in with Discord is completely optional if you want cross-device cloud sync, bookmarks, likes, and chapter comments.",
  },
  {
    question: "What are the alternate titles for Reverend Insanity?",
    answer:
      "Reverend Insanity is commonly searched as RI, Gu Zhenren (蛊真人), Master of Gu, and Daoist Gu. All refer to the same dark cultivation web novel written by Gu Zhenren.",
  },
];

/**
 * Generates Schema.org JSON-LD graph for the main landing page.
 */
export function buildHomeJsonLd(baseUrl: string = SITE_URL) {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const coverImage = `${normalizedBase}/images/book-cover.jpg`;
  const ogImage = `${normalizedBase}/opengraph-image`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${normalizedBase}/#website`,
        url: `${normalizedBase}/`,
        name: SITE_NAME,
        alternateName: ["RI Reader", "Reverend Insanity Online", "Gu Zhenren Reader"],
        description:
          "Free, ad-free online reader for all 2,334 chapters of Reverend Insanity (RI / Gu Zhenren / 蛊真人) in English and Chinese raw, with offline EPUB downloads and synced progress.",
        inLanguage: ["en", "zh-Hans"],
        keywords: SEO_KEYWORDS.slice(0, 35).join(", "),
        potentialAction: {
          "@type": "ReadAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${normalizedBase}/read?c={chapter_number}`,
          },
          "query-input": "required name=chapter_number",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${normalizedBase}/#webpage`,
        url: `${normalizedBase}/`,
        name: "Read Reverend Insanity (RI) Online Free — All 2,334 Chapters",
        isPartOf: { "@id": `${normalizedBase}/#website` },
        about: { "@id": `${normalizedBase}/#book` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: ogImage,
          width: 1200,
          height: 630,
        },
        breadcrumb: { "@id": `${normalizedBase}/#breadcrumb` },
        inLanguage: "en",
        description:
          "Read Reverend Insanity (RI) by Gu Zhenren online free. Best ad-free web novel reader for all 2,334 chapters in English & Chinese raw, with customizable typography and EPUB download.",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${normalizedBase}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${normalizedBase}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Read Online (2,334 Chapters)",
            item: `${normalizedBase}/read`,
          },
        ],
      },
      {
        "@type": "Book",
        "@id": `${normalizedBase}/#book`,
        name: NOVEL_TITLE,
        alternateName: [
          "RI",
          "Gu Zhenren",
          "蛊真人",
          "Master of Gu",
          "Daoist Gu",
        ],
        url: `${normalizedBase}/`,
        image: coverImage,
        author: {
          "@type": "Person",
          name: "Gu Zhenren",
          alternateName: "蛊真人",
        },
        character: [
          { "@type": "Person", name: "Fang Yuan", alternateName: "Great Love Immortal Venerable" },
          { "@type": "Person", name: "Bai Ning Bing" },
        ],
        genre: [
          "Xianxia",
          "Dark Fantasy",
          "Cultivation",
          "Xuanhuan",
          "Progression Fantasy",
          "Philosophical Fiction",
          "Web Novel",
        ],
        numberOfPages: NOVEL_CHAPTER_COUNT,
        inLanguage: ["en", "zh-Hans"],
        isAccessibleForFree: true,
        keywords: SEO_KEYWORDS.join(", "),
        description:
          "Humans are the spirit of all living beings, Gu are the essence of heaven and earth. Reborn into his fifteen-year-old body with the Spring Autumn Cicada, Fang Yuan walks an uncompromising path toward eternal life across 2,334 chapters.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${normalizedBase}/read`,
        },
        workExample: [
          {
            "@type": "Book",
            name: "Reverend Insanity — English Online Edition",
            bookFormat: "https://schema.org/EBook",
            inLanguage: "en",
            numberOfPages: NOVEL_CHAPTER_COUNT,
            isAccessibleForFree: true,
            url: `${normalizedBase}/read?edition=en`,
          },
          {
            "@type": "Book",
            name: "蛊真人 — Chinese Raw Online Edition",
            bookFormat: "https://schema.org/EBook",
            inLanguage: "zh-Hans",
            numberOfPages: NOVEL_CHAPTER_COUNT,
            isAccessibleForFree: true,
            url: `${normalizedBase}/read?edition=zh`,
          },
          {
            "@type": "Book",
            name: "Reverend Insanity — English EPUB Download",
            bookFormat: "https://schema.org/EBook",
            inLanguage: "en",
            isAccessibleForFree: true,
            url: `${normalizedBase}/downloads/Reverend_Insanity.epub`,
          },
          {
            "@type": "Book",
            name: "蛊真人 — Chinese Raw EPUB Download",
            bookFormat: "https://schema.org/EBook",
            inLanguage: "zh-Hans",
            isAccessibleForFree: true,
            url: `${normalizedBase}/downloads/Gu_Zhen_Ren_Raw.epub`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${normalizedBase}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
