# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are mobile web readers engaging in long reading sessions of *Reverend Insanity* on their phones (such as commutes, breaks, or late-night reading), wanting fast, distraction-free chapter access with optional bookmarks and chapter community interactions. Secondary readers include desktop readers, bilingual readers switching between English and Chinese editions, and readers downloading offline EPUB files.

## Product Purpose

ReverendReader is a dedicated web reader and community platform for Gu Zhenren's *Reverend Insanity* (蛊真人). It exists to provide immediate, comfortable access to all 2,334 chapters in both English and Chinese, paired with personal reading customization, cross-session reading continuity, and optional chapter-by-chapter discussion.

## Positioning

A dedicated single-novel sanctuary: ad-free, instant zero-account access to all 2,334 English and Chinese chapters, tailored for comfortable mobile reading, paired with optional Discord-synced progress, bookmarks, and chapter discussions that generic aggregator sites or static EPUB viewers do not combine cleanly.

## Operating Context

- **Core Routes**:
  - `/`: Novel entry page with synopsis, edition switcher (English / 中文原版), volume quick-jumps, reading entry point, and offline EPUB downloads.
  - `/read`: Full chapter reader supporting chapter navigation, searchable table of contents and chapter number jump, bookmarks, reading customization (typeface, spacing, width, theme, surface preset, local wallpaper upload, desktop scroll momentum), chapter likes, reactions, and threaded spoiler-guarded comments.
  - `/login` and `/account`: Optional Discord OAuth sign-in and account dashboard showing synced reading progress, saved bookmarks, and profile summary.
  - `/api/chapter` and `/auth/callback`: Byte-range chapter slice streaming endpoint and OAuth callback handler.
- **Usage Environments**: Mobile web browsers are the first priority (one-handed operation, uncluttered reading flow, and focus-safe inputs), with full support for tablet and desktop viewports.
- **Continuity Model**: Local-first persistence via cookies and browser `localStorage` works immediately without an account (including an offline-resilient progress sync queue). Signing in with Discord adds cross-device Supabase Postgres sync and participation in likes, reactions, and threaded chapter comments.

## Capabilities and Constraints

- **Open Access**: All 2,334 chapters and all reader customization settings work without an account or paywall; Discord OAuth is strictly optional.
- **Bilingual Corpus & Downloads**: Both English (`/chapters.json`, `/novel.txt`) and Chinese (`/chapters-zh.json`, `/novel-zh.txt`) editions are supported alongside downloadable EPUBs in `public/downloads/`.
- **Local-Only Media Privacy**: Custom reader background images remain strictly client-side in browser storage and are never uploaded to servers.
- **Security & State Contracts**: Preserve cookie settings sanitization (`lib/storage.ts`, `resolveSettingsFromCookies`), nonce-based CSP (`lib/security/csp.ts`), Supabase RLS/RPC safety, and the 20 offline security checks (`npm run test:security`).
- **Mobile-First Operational Constraint**: Prioritize mobile viewport ergonomics, clear touch targets, symmetrical unobstructed reading space, and mobile inputs sized to prevent unwanted browser zoom on focus.

## Brand Commitments

- **Identity**: **ReverendReader** / **Reverend Insanity** (Gu Zhenren / 蛊真人).
- **Voice & Demeanor**: Calm, editorial, direct, and respectful of the source work; free of ads, tracking banners, login gates, or hype.
- **Mark & Artwork**: Vector `蛊` emblem in `app/icon.svg` and `public/icon.svg`, plus existing book cover and artwork assets in `public/images/`.

## Evidence on Hand

- **Novel Data & Manifests**: `public/chapters.json`, `public/novel.txt` (English, 2,334 chapters); `public/chapters-zh.json`, `public/novel-zh.txt` (Chinese).
- **Offline Downloads**: `public/downloads/Reverend_Insanity.epub` and `public/downloads/Gu_Zhen_Ren_Raw.epub`.
- **Artwork Assets**: `public/images/book-cover.jpg`, `public/images/book-cover.webp`, `public/images/fang-yuan-creation.png`, `public/images/fang-yuan-creation.webp`, `public/images/fang-yuan-snow.jpg`, `public/images/fang-yuan-snow.webp`.
- **Font Assets**: `public/fonts/bookerly/`, `public/fonts/literata/`, `public/fonts/libre-baskerville/`, `public/fonts/opendyslexic-0.92/`, `public/fonts/roboto-3/`.
- **Verification & Data Schema**: `scripts/test-security.ts`, `scripts/verify-supabase.ts`, and `supabase/migrations/`.
- **Explicit Absences**: No user testimonials, readership counts beyond chapter counts (2,334), external reviews, or commercial pricing exist in the repository and must not be fabricated.

## Product Principles

1. **Mobile Reading First**: Optimize every control, navigation path, and reading flow for comfortable phone use before adapting upward to larger screens.
2. **Open Reading Sanctuary**: Keep all 2,334 chapters and core reading tools instant, ad-free, and accessible with zero login wall.
3. **Resilient Continuity**: Preserve reading place, settings, and bookmarks seamlessly offline and across sessions, syncing to Supabase only when signed in.
4. **Peripheral Community**: Offer chapter discussions, reactions, and likes alongside reading without crowding or obscuring the prose.

## Accessibility & Inclusion

- Supports customizable reading typography (font families including OpenDyslexic in `public/fonts/opendyslexic-0.92/`, size, line spacing, letter spacing, alignment, column width), high-contrast Light/Dark modes, keyboard shortcuts (`ArrowLeft`/`ArrowRight`, `Escape`), ARIA labels/pressed states, and non-zooming mobile form fields.
- A formal external accessibility standard target (e.g., WCAG AA audit compliance) has not yet been decided in product setup.
