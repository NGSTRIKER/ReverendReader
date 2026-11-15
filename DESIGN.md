---
name: Reverend Reader
description: Calm, bilingual editorial sanctuary for reading all 2,334 chapters of Reverend Insanity across mobile and desktop.
colors:
  seal-vermilion: "#af1d27"
  seal-vermilion-deep: "#91151e"
  antique-gold: "#d0be94"
  antique-gold-lifted: "#e0d0a8"
  warm-paper: "#faf8f3"
  clean-surface: "#fffefb"
  sunken-parchment: "#f1ede5"
  carbon-ink: "#181714"
  stone-muted: "#625e56"
  umber-faint: "#6e685e"
  hairline: "#e0dacf"
  hairline-strong: "#c6beb0"
  on-seal: "#ffffff"
  night-paper: "#0d0f0e"
  night-surface: "#151816"
  night-sunken: "#111312"
  night-ink: "#eae7df"
  night-muted: "#98958c"
  night-line: "#282c29"
  on-gold: "#0e100f"
  danger-crimson: "#b91c1c"
  success-jade: "#166534"
typography:
  display:
    fontFamily: "Bookerly, var(--font-serif), EB Garamond, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bookerly, var(--font-serif), EB Garamond, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Bookerly, var(--font-serif), EB Garamond, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0em"
  body:
    fontFamily: "Bookerly, var(--font-serif), EB Garamond, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0em"
    fontFeature: "\"kern\", \"liga\", \"onum\""
  ui-body:
    fontFamily: "var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
    fontFeature: "\"kern\", \"liga\""
  label:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.08em"
  mono-telemetry:
    fontFamily: "var(--font-mono), JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.14em"
    fontFeature: "\"tnum\", \"lnum\""
  reader-literary:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0em"
  reader-dyslexic:
    fontFamily: "\"OpenDyslexic\", var(--font-sans), system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.02em"
rounded:
  cover: "6px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.seal-vermilion}"
    textColor: "{colors.on-seal}"
    typography: "{typography.ui-body}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.seal-vermilion-deep}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.ui-body}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.sunken-parchment}"
  button-circle-icon:
    backgroundColor: "transparent"
    textColor: "{colors.stone-muted}"
    rounded: "{rounded.full}"
    size: "44px"
  seal-badge:
    backgroundColor: "rgba(175, 29, 39, 0.1)"
    textColor: "{colors.seal-vermilion}"
    typography: "{typography.mono-telemetry}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  field-input:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.ui-body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  card-surface:
    backgroundColor: "{colors.clean-surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  edition-option:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "48px"
  reader-thumb-dock:
    backgroundColor: "{colors.clean-surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.xl}"
    padding: "6px 8px"
---

# Design System: Reverend Reader

## Overview

**Creative North Star: "Editorial Seal & Warm Manuscript"**

Reverend Reader treats an unforgiving 2,334-chapter dark fantasy novel with the stillness and discipline of a stitched manuscript edition. Rather than wrapping reading in terminal neon gradients, orbital hero chrome, or sticky engagement badges, the interface steps backward until only warm paper, crisp carbon ink, and a sparse cinnabar chop remain. Reading prose is the primary surface; every navigation rail, bookmark control, and community drawer is designed to recede cleanly when prose begins.

Mobile phones are the first-priority environment. On viewports below `640px`, controls consolidate into a unified docked bottom thumb bar balanced against a compact header so thumbs never hunt upward across the glass and prose preserves generous horizontal breathing room. On tablet and desktop viewports, navigation expands into a symmetric header paired with a whisper-quiet right interaction rail, never breaking the centered reading measure.

**Key Characteristics:**
- Tactile manuscript warmth in daylight (`#faf8f3` paper and `#af1d27` vermilion chop) paired with restrained OLED charcoal (`#0d0f0e`) and muted antique gold (`#d0be94`) at night.
- Literary serif hierarchy led by Bookerly and EB Garamond for titles and long-form prose, disciplined by DM Sans chrome and tabular JetBrains Mono numerals.
- Crisp 1px hairline containment and tonal surface steps (`paper` -> `surface` -> `sunken`) instead of heavy elevation drop shadows.
- Mobile-first thumb ergonomics (`44px–48px` primary targets, non-zooming `16px` mobile inputs, `env(safe-area-inset-bottom)` clearance) with instant zero-gate access to both English and Chinese editions.

## Colors

The palette pairs neutral parchment and mineral ink tones with a single restrained cinnabar seal accent in daylight and muted antique gold in night reading mode, keeping every foreground-background pairing above WCAG AA contrast (`>= 4.5:1`).

### Primary
- **Seal Vermilion** (`#af1d27` / `oklch(48.8% 0.180 24.3)`): Light-mode primary CTA fill (`Start reading`, `Retry`), active edition selection border, inline emblem (`蛊` seal badge), active tab underline, and primary brand emphasis (`6.53:1` against warm paper; white text `#ffffff` on fill yields `6.94:1`).
- **Seal Vermilion Deep** (`#91151e` / `oklch(42.4% 0.157 24.3)`): Hover and active state for filled primary buttons and links.

### Secondary
- **Antique Gold** (`#d0be94` / `oklch(80.6% 0.060 87.5)`): Dark-mode primary accent replacing vermilion on `#0d0f0e` OLED charcoal (`10.51:1` against night paper), used for active borders, seal emblems, primary buttons paired with `#0e100f` text (`10.43:1`), and chapter eyebrows.
- **Antique Gold Lifted** (`#e0d0a8` / `oklch(86.1% 0.056 88.8)`): Dark-mode hover and active accent state.

### Neutral
- **Warm Paper** (`#faf8f3` / `oklch(97.9% 0.007 88.6)`): Default daylight canvas background (`html` and `body`), form field interiors, and default reading ground.
- **Clean Surface** (`#fffefb` / `oklch(99.7% 0.004 91.4)`): Elevated daylight cards, modals, drawers, sticky dock, and reader card surface.
- **Sunken Parchment** (`#f1ede5` / `oklch(94.7% 0.012 84.6)`): Inactive tab strips, hover fills on quiet buttons and circle controls, skeleton loaders, and avatar backs.
- **Carbon Ink** (`#181714` / `oklch(20.5% 0.006 91.6)`): Primary body prose, display headings, and high-emphasis interactive labels (`16.89:1` on warm paper).
- **Stone Muted** (`#625e56` / `oklch(48.3% 0.014 84.6)`): Secondary metadata, chapter synopses, breadcrumb captions, and resting icon color (`6.08:1` on warm paper).
- **Umber Faint** (`#6e685e` / `oklch(52% 0.017 80.7)`): Input placeholders and tertiary stamps (`5.20:1` on warm paper).
- **Hairline** (`#e0dacf` / `oklch(89% 0.016 82.8)`) & **Hairline Strong** (`#c6beb0` / `oklch(80.4% 0.021 81.8)`): 1px structural borders, section dividers, quiet button outlines, and input strokes.
- **Night Paper** (`#0d0f0e` / `oklch(16.6% 0.004 164.5)`), **Night Surface** (`#151816` / `oklch(20.5% 0.006 156.7)`), **Night Ink** (`#eae7df` / `oklch(92.8% 0.011 89.7)`), **Night Muted** (`#98958c` / `oklch(67% 0.013 91.6)`): Dark-mode tonal stack maintaining `15.57:1` ink contrast and `6.42:1` muted contrast.
- **Danger Crimson** (`#b91c1c` light / `#e46464` dark) & **Success Jade** (`#166534` light / `#7abc8e` dark): Inline validation errors, comment moderation alerts, sign-out warnings, and synced state indicators.

### Named Rules
**The One-Chop Rule.** Reserve the vermilion (or antique gold in dark mode) fill exclusively for the primary reading action, active selection indicator, and inline `蛊` seal mark; secondary actions stay neutral ink over hairline borders so accent never exceeds roughly 10% of the viewport.

**The AA Paper Contrast Rule.** Every scoped dark or tinted reader surface inside `[data-reader-surface]` rebinds `--paper`, `--surface`, `--ink`, `--muted`, `--line`, and `--accent` locally in CSS so headings, links, and footer buttons stay readable (`>= 4.5:1`) regardless of global light or dark theme; the `#e4e8f0` sentinel acts solely as Auto Ink and never forces pale gray ink onto daylight or translucent surfaces.

## Typography

**Display Font:** Bookerly (backed by EB Garamond, Georgia, serif)
**Body Font:** Bookerly (backed by EB Garamond, Georgia, serif; Reader supports user switching across Serif, Editorial EB Garamond, Literata, DM Sans, Times, OpenDyslexic, Bellota, and JetBrains Mono)
**UI / Label Font:** DM Sans (`--font-sans`), paired with JetBrains Mono (`--font-mono`) for tabular chapter indices and word counts

**Character:** Classical editorial warmth for sustained prose paired with crisp geometric UI controls and lining tabular figures that prevent chapter counters (`1 / 2334`) or word counts from jittering horizontally.

### Hierarchy
- **Display** (`400`, `clamp(2rem, 5vw, 4rem)`, `1.06` line-height, `-0.02em` tracking): Landing hero title (`Reverend Insanity`), pairing upright ink with italic accent emphasis.
- **Headline** (`700`, `1.5rem–2.25rem`, `1.25` line-height, `-0.015em` tracking): Reader chapter titles (`h1`) and major section headings (`h2`).
- **Title** (`500`, `1.125rem`, `1.35` line-height): Volume card headings and modal/drawer dialog headers (`h2`).
- **Body Prose** (`400`, user-configurable `14px–32px` around `1.0625rem` base, `1.8` line-height, `"kern", "liga", "onum"`): Reader paragraphs and multi-paragraph editorial summaries.
- **UI Body** (`400–600`, `0.875rem` desktop / `1rem` inside mobile inputs, `1.5` line-height): Buttons, navigation items, drawer comments, and form fields.
- **Label / Mono Telemetry** (`500`, `0.72rem` uppercase small-caps or `0.75rem` mono at `0.08em–0.2em` tracking with `tabular-nums lining-nums`): Eyebrows, chapter indices, word counts, and reading times.

### Named Rules
**The Tabular Counter Rule.** Apply `tabular-nums lining-nums` (`tnum`) to every chapter number, reaction count, percentage readout, and word count so live progress updates and adjacent columns never shift laterally.

**The Anti-Zoom Input Rule.** Render interactive `<input>`, `<textarea>`, and `<select>` elements at `16px` (`text-base`) on viewports below `640px`, stepping down to `14px` (`sm:text-sm`) only on desktop so mobile Safari and Chrome never pinch-zoom the reading viewport on focus.

## Layout

Reverend Reader operates across two spatial bands: a centered `1250px` editorial landing container and a focused single-column reading canvas inside `/read`. Page outer horizontal padding expands from `14px` (`px-3.5`) on phones to `32px` (`sm:px-8`) and `48px` (`lg:px-12`) on wide screens while keeping `overflow-x: clip` at `html`/`body`.

On viewports below `640px`:
- Landing Hero splits cover thumbnail and volume metadata into a compact horizontal block (`flex-row`) before the bordered manuscript intro card, holding the `EN | 中文` edition selector (`grid-cols-2`) and full-width `48px`-tall `Start reading` button strictly above the fold at `375px` width.
- Reader navigation narrows the top header to `52px` (`h-[52px]`) carrying home emblem, chapter trigger, compact `EN/中` toggle, theme switch, and compact account avatar, moving `Prev | Ch. X | Next | Comments | Engage | Settings | Hide` into a full-width fixed bottom dock padded by `env(safe-area-inset-bottom, 0px)`, with `96px` (`pb-24`) footer clearance under chapters so the last paragraph and footer buttons never hide beneath the dock.

On `>= 640px` (`sm` / `md` / `lg`) viewports:
- Landing Hero switches to a `270px` cover column alongside the manuscript card (`lg:grid-cols-[270px_1fr]`).
- Reader header (`56px`, `h-14`) restores desktop quick chapter arrows and TOC/Bookmark/Settings shortcuts, while the bottom dock rotates into a compact vertical right-edge rail centered on the viewport (`sm:right-0 sm:top-1/2 sm:-translate-y-1/2`).

## Elevation & Depth

Surfaces communicate hierarchy primarily through tonal contrast (`paper` -> `surface` -> `sunken`) and crisp `1px solid` hairlines (`--line`, `--line-strong`), reserving ambient shadows exclusively for transient overlapping layers (`shadow-pop`, `shadow-sheet`). Cards at rest rely on border delineation rather than persistent drop shadows.

### Shadow Vocabulary
- **Subtle Rest Lift** (`shadow-sm` — Tailwind subtle 1px shadow): Anchors primary filled CTA buttons and landing hero manuscript frame without diffusing edges.
- **Floating Popover (`pop`)** (`0 1px 2px rgb(var(--shadow) / 0.05), 0 8px 24px -4px rgb(var(--shadow) / 0.14)`): Used on account dropdown menus, reader bottom dock/rail, toast notices, and the mobile Engage popover (`backdrop-blur-md`).
- **Modal & Drawer Sheet (`sheet`)** (`0 0 0 1px rgb(var(--line)), 0 20px 40px -10px rgb(var(--shadow) / 0.22)`): Used on Settings, Chapters TOC, Info, Report dialogs, and the Comments slide-over drawer.

### Named Rules
**The Hairline-First Rule.** Resting cards, navigation bars, and list containers establish depth through a `1px` `--line` stroke and a single tonal paper step; apply `shadow-pop` or `shadow-sheet` only to floating popovers, sticky rails, toast notices, and modal sheets that occlude underlying prose.

## Shapes

- **Sharp-Edged Editorial Restraint**: Book cover frames use a tight `6px` radius (`book-cover-frame`), compact badges use `6px` (`rounded-md`), primary interactive controls and fields use `8px` (`rounded-lg`), cards and spacious reader blocks scale cleanly to `12px–16px` (`rounded-xl` / `rounded-2xl`), and utility icon controls (`circle-icon-btn`, reaction toggles, theme switches) are strict circles (`9999px`).
- **Mobile Bottom Sheets**: Dialogs (`SettingsModal`, `ChapterSelectorModal`, `InfoModal`, `CommentsDrawer` report modal) dock cleanly with top-rounded edges (`rounded-t-2xl sm:rounded-2xl`) on narrow phones and cap height at `88dvh`.
- **Clipping & Containment**: Dialogs clip inner sticky headers cleanly with `overflow-hidden`; long chapter titles and foreign terms wrap via `overflow-wrap: anywhere` (`.wrap-break`).

## Components

Every interactive component balances one-handed mobile tap reliability (`>= 44×44px` hit areas below `640px`) with quiet editorial restraint at rest.

### Buttons
- **Shape & Spacing:** Slightly rounded rectangular controls (`8px` radius, upgrading to `12px` on standalone footer/retry CTAs), enforcing `whitespace-nowrap` so labels never wrap awkwardly on narrow screens.
- **Primary (`btn-primary`):** Solid vermilion (`#af1d27`) in light mode or antique gold (`#d0be94`) in night mode with crisp `on-accent` text (`12px 20px` padding, `48px` min height on hero CTA / `44px` inside dialogs/footers). Hover shifts smoothly (`150ms`) to deep vermilion (`#91151e`) or lifted gold (`#e0d0a8`).
- **Quiet (`btn-quiet`):** Transparent surface framed by a `1px` strong hairline (`--line-strong`) and primary ink label (`8px 14px` padding, `44px` mobile height). Hover transitions to `sunken` fill and stronger ink stroke.
- **Circle Icon Control (`circle-icon-btn`):** Circular outline button (`44px × 44px` mobile, `36px × 36px` desktop) with `1px` `--line` border, muted foreground, `active:scale-[0.97]` detent, and `:focus-visible` `2px` accent ring.

### Chips & Badges
- **Seal Stamp Badge (`seal-badge`):** Inline vermilion chop mark (`蛊`) rendered in tabular monospace semibold (`12px`), `6px` radius (`rounded-md`), `40%` opacity accent border, and `10%` accent tint wash (`2px 8px` padding).

### Cards / Containers
- **Corner Style & Surfaces:** `12px–16px` rounded containers (`surface` `#fffefb` over `paper` `#faf8f3` in daylight; `#151816` over `#0d0f0e` at night), internal padding `16px–24px` (`p-4 sm:p-6`), bordered by `1px` `--line` with hover border escalation to `--line-strong` + `--sunken` fill on interactive volume cards.

### Inputs / Fields
- **Style:** `8px` radius (`rounded-lg`), `1px` `--line-strong` border, `paper` fill, `44px` mobile tap height, `16px` mobile / `14px` desktop text size to disable iOS focus zoom.
- **Focus:** Transitions border to `--accent` paired with global `2px solid rgb(var(--accent))` `:focus-visible` ring (`2px` offset).

### Navigation
- **Top Chrome:** Sticky `1px` bordered bar (`bg-paper/90 backdrop-blur-md`, `56px–64px` on landing, `52px–56px` in reader) plus keyboard-accessible `Skip to content` link.
- **Mobile Reader Thumb Dock:** Fixed full-width bottom bar (`z-40`, `bg-surface/95 backdrop-blur-md`, top border `--line`, `env(safe-area-inset-bottom)` safe padding) hosting 7 one-thumb actions (`Prev`, `Ch. X`, `Next`, `Comments`, `Engage` popover with Like + Bookmark + 5 Gu Reactions, `Settings`, `Hide`) that collapses to a floating `44×44px` reveal button with focus handoff and `inert` hiding when minimized.

### Modals & Slide-Over Drawers
- **Behavior:** Managed via `useDialogAccessibility` with focus trapping, `Escape` dismissal (with nested-dialog suppression), scroll lock, restore-focus-on-close, proper `role="tablist"`/`role="tab"`/`role="tabpanel"` ARIA tabs, two-step inline confirmation for destructive bookmark or comment deletions, and `.drawer-enter` slide motion (`0.2s cubic-bezier(0.16, 1, 0.3, 1)`), flattening to `0.01ms` under `prefers-reduced-motion: reduce`.

### Edition Radio Selector
- **Style:** Side-by-side 2-column `role="radiogroup"` (`English` / `中文原版`) inside Hero card with `48px` min-height buttons, left-aligned typography, and vermilion/gold `10%` tint border swap when selected.

## Do's and Don'ts

### Do:
- **Do** enforce minimum `44×44px` touch targets on `<640px` mobile buttons, tabs, icon switches, and bottom dock controls, honoring `env(safe-area-inset-bottom)` under fixed bars.
- **Do** keep dark/tinted custom reader themes isolated inside `[data-reader-surface]` scopes so theme variables invert ink, muted copy, hairlines, and buttons together at WCAG AA contrast.
- **Do** preserve `16px` (`text-base`) input font sizes on mobile viewports, explicit `tabular-nums lining-nums` on chapter numbers and counters, and inline two-step confirmations for destructive bookmark or comment deletions.
- **Do** keep accent color disciplined via warm paper/ink hierarchy and 1px hairline separation before introducing shadows only on floating overlays.

### Don't:
- **Don't** introduce glowing orbs, tilted rotational book cover frames, glassmorphic dark gradients, or decorative dots behind landing headlines.
- **Don't** duplicate navigation controls across both mobile top header and bottom dock simultaneously or allow custom wallpaper images to upload to remote storage.
- **Don't** use `#e4e8f0` (Auto Ink sentinel) directly as a literal dark-text override onto daylight surfaces or hide focus indicators without replacing them cleanly via `:focus-visible`.
- **Don't** mutate cookie keys, `DEFAULT_SETTINGS` fallback literals (`"mono"`, `"matte-terminal"`, `"#e4e8f0"`), or CSP/security contracts maintained by `scripts/test-security.ts`.
