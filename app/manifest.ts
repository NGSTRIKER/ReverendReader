import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reverend Reader — Reverend Insanity Online",
    short_name: "Reverend Reader",
    description:
      "Read all 2,334 chapters of Reverend Insanity (RI / Gu Zhenren) online free in English and Chinese raw with bookmarks and offline EPUB downloads.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f3",
    theme_color: "#af1d27",
    categories: ["books", "literature", "entertainment"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
