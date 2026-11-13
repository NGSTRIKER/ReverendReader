# ReverendReader 蛊

A modern, high-performance web reader and community platform for the web novel **Reverend Insanity** (Gu Zhenren / 蛊真人). Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │              Browser UI              │
                      │  (Next.js App Router + React 19)     │
                      └──────────────────┬───────────────────┘
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
        ┌────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │   Landing Page     │ │  Reader Engine    │ │  User Dashboard   │
        │  (/, Hero, Orbs)   │ │  (/read, Nav,     │ │  (/account)       │
        │                    │ │   Content, Fonts) │ │                   │
        └────────────────────┘ └─────────┬─────────┘ └─────────┬─────────┘
                                         │                     │
                                         ▼                     ▼
                      ┌──────────────────────────────────────┐
                      │            Client Services           │
                      │  - Progress Queue (offline-first)    │
                      │  - LocalStorage & Cookie Sync        │
                      │  - Theme & Typography Manager        │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │          Backend & Storage           │
                      │  - Next.js Route Handlers (/api)     │
                      │  - Supabase Auth (OAuth, SSR)        │
                      │  - Supabase Postgres (RLS, CAS sync) │
                      │  - Public Manifests & Chapter JSONs  │
                      └──────────────────────────────────────┘
```

---

## File-by-File Guide: What Each File Does (In Plain English)

Here is a human-friendly breakdown of every tracked file in this repository, grouped by its role.

### 1. Root & Configuration Files

| File | What it does in simple terms |
| :--- | :--- |
| **`package.json`** | The project's manifest. Lists all installed JavaScript libraries (Next.js, Supabase, Tailwind, Lucide icons, etc.) and npm scripts (`dev`, `build`, `start`, `lint`, `test:security`, `verify:supabase`). |
| **`package-lock.json`** | Records exact dependency versions installed in `node_modules` so builds are 100% reproducible across machines. |
| **`tsconfig.json`** | Configures TypeScript rules and path shortcuts (such as allowing `@/*` to point straight to the root folder). |
| **`next.config.ts`** | Settings for Next.js. Manages image optimization rules, security headers, static asset `Cache-Control` policies (`/fonts/:path*`, `/chapters.json`, `/chapters-zh.json`), compiler preferences, and server behaviors. |
| **`next-env.d.ts`** | An auto-generated TypeScript declaration file that ensures the compiler understands Next.js global types. |
| **`tailwind.config.ts`** | The design blueprint for Tailwind CSS. Defines custom colors (paper, ink, accent, sunken), custom typography font families (`sans` / DM Sans, `bellota`, `literary`, `mono`, `serif`), and dark mode tokens. |
| **`postcss.config.mjs`** | Tells the build pipeline to process CSS through Tailwind CSS and Autoprefixer (for cross-browser CSS compatibility). |
| **`eslint.config.mjs`** | Linting rules for clean, bug-free TypeScript and React code. |
| **`.env.example`** | An example environment variables template showing which Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are needed to run the app. |
| **`.gitignore`** | Tells Git which files to never commit (e.g., `node_modules`, secret `.env` files, `.next` build caches). |
| **`middleware.ts`** | Gatekeeper code that runs before dynamic page or API requests. Refreshes user auth tokens, sets security headers (CSP), handles cookie sessions, and excludes static images, fonts, manifests, and `.epub` downloads. |
| **`googleddd765da26430ef2.html`** | A static verification file required by Google Search Console to prove domain ownership for SEO indexing. |

---

### 2. Next.js App Router (`app/`)

The `app/` directory uses the Next.js App Router to define pages, layouts, and backend API endpoints.

| File | What it does in simple terms |
| :--- | :--- |
| **`app/layout.tsx`** | The master wrapper around every page. Sets HTML tags, default metadata (title, description, social cards), self-hosts Google Fonts (`DM Sans` and `Bellota` via `next/font/google`), and injects theme restoration scripts so screens don't flicker on load. |
| **`app/globals.css`** | The core stylesheet. Contains CSS reset rules, theme variable definitions (light, dark, sepia, terminal), `.reader-content` typography rules, and reusable utility classes (`.icon-btn`, `.field`). |
| **`app/page.tsx`** | The landing / home page (`/`). Welcomes visitors with the interactive 3D orb sphere, novel overview, synopsis, quick chapter jump links, and feature showcases. |
| **`app/read/page.tsx`** | The reading page (`/read`). Reads the active chapter slice directly on the server, resolves authenticated progress and sanitized reader settings from cookies (`resolveSettingsFromCookies`), and leaves full manifest loading to the client to keep SSR payloads lean. |
| **`app/login/page.tsx`** | The sign-in page (`/login`). Lets users log in with OAuth providers (Google, Discord) or magic links to sync their bookmarks and reading progress across multiple devices. |
| **`app/account/page.tsx`** | The user profile dashboard (`/account`). Shows reading statistics, cloud-saved bookmarks, current chapter progress, and account management options. |
| **`app/robots.ts`** | Automatically generates `robots.txt` so search engine crawlers know which pages to index and which to ignore. |
| **`app/sitemap.ts`** | Automatically generates XML sitemaps to help search engines discover novel pages, the landing page, and reader routes. |
| **`app/icon.svg`** | The primary vector favicon and application icon (the Chinese character 蛊 "Gu"). |
| **`app/auth/callback/route.ts`** | An API route that Supabase redirects users to after they log in. It exchanges the temporary auth code for a permanent session cookie and redirects them back to where they were reading. |
| **`app/api/chapter/route.ts`** | A lightweight backend API endpoint that streams validated chapter byte ranges with `HTTP 200`, async file-size caching, `X-Content-Type-Options: nosniff`, and CDN/browser `Cache-Control` headers. |

---

### 3. Component Architecture (`components/`)

All user interface elements are organized into modular, reusable React components.

#### Reader Experience (`components/reader/`)
| File | What it does in simple terms |
| :--- | :--- |
| **`ReaderInterface.tsx`** | The brain of the reader. Coordinates lazy manifest fetching (`force-cache`), chapter prefetching, debounced settings persistence, validated custom backgrounds, bookmark toggling, and keyboard shortcuts. |
| **`ChapterNavigation.tsx`** | The top header bar during reading. Features an auto-hiding navigation bar optimized for narrow mobile portrait screens and desktops, chapter prev/next buttons, table-of-contents quick-jump, reader settings trigger, and user account status. |
| **`ChapterContent.tsx`** | Memoized (`React.memo`) chapter renderer. Displays the chapter heading and paragraphs with customizable font family (`getReaderFontClass`), sizing, line height, and bottom navigation controls. |
| **`ChapterSelectorModal.tsx`** | The popup Table of Contents (Index). Uses deferred search filtering (`useDeferredValue`) across all 2,334 chapters, shows loading state while the manifest initializes, and supports volume jumping and bookmarks. |
| **`SettingsModal.tsx`** | The customization modal dialog. Allows readers to adjust font sizes, margins, line spacing, reading themes (light, dark, sepia, midnight, terminal), typography, and desktop scroll fluidity. |
| **`ScrollFluiditySelector.tsx`** | A dedicated control panel in settings for desktop users to adjust mouse wheel scroll momentum, choose inertia presets (Off, Gentle, Smooth, Fluid, Ultra), fine-tune damping, and test scrolling in an interactive sandbox. |
| **`useFluidScroll.ts`** | A high-performance physics-based custom React hook using `requestAnimationFrame` that gives desktop mouse wheel scrolling smooth inertial momentum based on scrolling speed. |
| **`FontSelector.tsx`** | A dedicated font switcher widget embedded in the settings modal. Previews and applies reader fonts including **Bellota** (Calligraphic / Artisan), **DM Sans**, **Literata**, **Mono**, and **Serif**. |
| **`CommentsDrawer.tsx`** | An interactive drawer that lets readers view, post, and reply to community comments and paragraph thoughts. |
| **`InteractionSidebar.tsx`** | A subtle side widget on the right edge of the screen for quick one-click access to comments, bookmarks, and reader tools while scrolling. |
| **`BackgroundManager.tsx`** | Manages custom paper textures, subtle noise grain, and atmospheric reading wallpapers. |
| **`reactionIcons.ts`** | Helper definitions mapping emoji reactions (like, fire, skull, heart, mind-blown) to icons used across chapter discussions. |

#### Landing Page (`components/landing/`)
| File | What it does in simple terms |
| :--- | :--- |
| **`HeroSection.tsx`** | The top section of the homepage featuring dramatic typography, call-to-action buttons ("Start Reading", "Continue Chapter"), and novel stats. |
| **`Navigation.tsx`** | The homepage header bar with logo, navigation links, theme switcher, and sign-in button. |
| **`SpinningOrbsSphere.tsx`** | An interactive 3D particle canvas animation creating an atmospheric sphere of glowing lights on the homepage. |
| **`SynopsisSection.tsx`** | An editorial section outlining the story premise, Fang Yuan's philosophy, power progression (Gu cultivation), and book arcs. |
| **`InfoModal.tsx`** | A modal dialog providing new readers with an introduction, reading guide, and background information about the novel. |
| **`Footer.tsx`** | The footer at the bottom of the landing page with project links, disclaimers, and community channels. |

#### Auth, Account & Common UI (`components/auth/`, `components/account/`, `components/ui/`)
| File | What it does in simple terms |
| :--- | :--- |
| **`components/auth/UserNav.tsx`** | The user profile icon and dropdown in headers. Shows current login status, user avatar/name, account links, or a compact "Sign In" button. |
| **`components/account/AccountView.tsx`** | The main dashboard view on the `/account` page, displaying saved reading history, active bookmarks, and logout controls. |
| **`components/ui/ThemeToggle.tsx`** | A one-click button to cycle through light, dark, and custom themes with smooth CSS transitions. |
| **`components/ui/DiscordIcon.tsx`** | An SVG icon component representing Discord, used for community links and OAuth login buttons. |

---

### 4. Utilities, Security & Supabase Services (`lib/`)

Houses reusable helper functions, offline synchronization queues, and database connectors.

| File | What it does in simple terms |
| :--- | :--- |
| **`lib/theme.ts`** | Theme management logic. Handles storing selected themes in cookies and `localStorage`, and toggling theme attributes on the `<html>` root. |
| **`lib/storage.ts`** | Browser storage and SSR cookie abstraction. Exposes `sanitizeSettings()`, `resolveSettingsFromCookies()`, and `getReaderFontClass()` to validate, clamp, and persist reader preferences, local bookmarks, and sidebar state safely. |
| **`lib/chapterFetcher.ts`** | Handles loading chapter text from the server or static JSON files, cleaning up raw text formatting, and prefetching upcoming chapters in the background for instant pagination. |
| **`lib/security/csp.ts`** | Generates strict Content Security Policy (CSP) headers and nonces (with safe URL fallback handling) to protect readers from cross-site scripting (XSS) and injection attacks. |
| **`lib/auth/origin.ts`** | Validates incoming request hostnames and origins to prevent malicious phishing and host-header spoofing. |
| **`lib/auth/redirect.ts`** | Sanitizes redirect URLs after login to protect against open-redirect vulnerabilities. |
| **`lib/supabase/client.ts`** | Creates the browser-side Supabase client using cookies so client components can read and write authenticated data. |
| **`lib/supabase/server.ts`** | Creates the server-side Supabase client for Server Components and Route Handlers, safely handling cookie contexts. |
| **`lib/supabase/middleware.ts`** | Connects Supabase auth session refreshes directly into Next.js edge middleware. |
| **`lib/supabase/config.ts`** | Validates that required Supabase environment variables exist and are properly formatted before the app boots. |
| **`lib/supabase/sync.ts`** | Cloud sync engine. Synchronizes local reading progress, bookmarks, and settings with the remote Supabase PostgreSQL database when a user is signed in. |
| **`lib/supabase/progressQueue.ts`** | An offline-first, resilient sync queue. If a reader scrolls through chapters while offline or on an unstable mobile connection, this queue buffers progress updates locally and synchronizes them to Supabase using Compare-and-Swap (CAS) to prevent lost updates or race conditions. |
| **`lib/supabase/social.ts`** | Data access functions for the social layer: querying chapter comments, submitting new comments, and voting or reacting. |

---

### 5. Type Definitions (`types/`)

| File | What it does in simple terms |
| :--- | :--- |
| **`types/novel.ts`** | TypeScript interfaces for all novel data: chapter metadata, manifest structures, reader settings (font size, margin, line height, theme), bookmarks, and edition types (`en` or `zh`). |
| **`types/database.ts`** | TypeScript types representing the Supabase PostgreSQL database schema (tables: `profiles`, `reading_progress`, `bookmarks`, `chapter_comments`, `comment_reactions`). |

---

### 6. Database Migrations (`supabase/`)

SQL scripts defining the database structure, security rules, and functions in Supabase PostgreSQL.

| File | What it does in simple terms |
| :--- | :--- |
| **`supabase/config.toml`** | Configuration file for running Supabase locally using the Supabase CLI. |
| **`supabase/migrations/20261104000000_account_and_reading_data.sql`** | Initial migration creating user profile records, reading progress tracking, and bookmarks tables with foreign key constraints. |
| **`supabase/migrations/20261104010000_security_remediation.sql`** | Hardens database security by enabling Row Level Security (RLS) on all tables, ensuring users can only read and write their own data. |
| **`supabase/migrations/20261104020000_concurrency_and_grants_hardening.sql`** | Grants explicit least-privilege permissions to authenticated and anonymous database roles and optimizes indexes. |
| **`supabase/migrations/20261104030000_progress_cas_and_acl.sql`** | Adds a database function for Compare-and-Swap (CAS) progress updates, preventing conflicts when the same user reads on both phone and laptop. |
| **`supabase/migrations/20261104040000_chapter_social_system.sql`** | Adds tables and RLS policies for chapter comments, nested replies, timestamps, and emoji reactions. |

---

### 7. Scripts & Data Pipeline (`scripts/`)

Command-line utilities for converting source novel files, validating data integrity, and testing security.

| File | What it does in simple terms |
| :--- | :--- |
| **`scripts/convert_epub.py`** | A Python script that parses the English `Reverend Insanity` EPUB, extracts all chapters, cleans the text, and exports structured JSON manifests into `public/`. |
| **`scripts/convert_chinese_epub.py`** | A Python script that parses the raw Chinese `蛊真人` EPUB, cleans chapter headers, and outputs Chinese edition manifests (`chapters-zh.json`). |
| **`scripts/test_manifest.py`** | A validation script that checks the generated chapter JSON files to ensure no chapters are missing, indices are sequential, and word counts are accurate. |
| **`scripts/verify-supabase.ts`** | A Node/TypeScript verification tool that tests whether Supabase tables, RLS policies, and credentials are functioning correctly. |
| **`scripts/test-security.ts`** | Automated offline security test suite (`npm run test:security`, 20 checks) verifying CSP headers, auth redirection rules, cookie/settings sanitization, social write sanitization, and offline progress queue invariants. |

---

### 8. Static Assets (`public/` & `assets/`)

| Folder / File | What it does in simple terms |
| :--- | :--- |
| **`public/chapters.json`** | Pre-processed metadata and index for all 2,334 English chapters. |
| **`public/chapters-zh.json`** | Pre-processed metadata and index for Chinese edition chapters. |
| **`public/novel.txt` & `public/novel-zh.txt`** | Full-text novel source archives used by chapter extraction scripts and fast reading lookup. |
| **`public/downloads/`** | Bundled offline EPUB files that users can download directly to e-readers (Kindle, Kobo). |
| **`public/fonts/`** | Locally hosted web fonts (Bookerly, Literata, Libre Baskerville, Roboto, OpenDyslexic) so the reader does not rely on third-party CDNs and loads instantly. |
| **`public/images/`** | Optimized WebP and JPEG images for book covers and character art (e.g., Fang Yuan illustrations). |
| **`assets/epub/`** | Original source EPUB archives preserved for reproducible builds. |

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/NGSTRIKER/ReverendReader.git
cd ReverendReader

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# (Fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Verification & Security Checks

```bash
# Run offline security test suite (20 checks)
npm run test:security

# Run ESLint and TypeScript type-checking
npm run lint
npx tsc --noEmit

# Build production bundle (fetches self-hosted fonts via next/font/google)
npm run build
```

---

## License

This project is created for educational and community reading purposes. All novel text and lore belong to the original author **Gu Zhenren (蛊真人)**.
