"use client";

import React, { useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);

  // Parallax mouse movement handler using requestAnimationFrame (zero React re-renders)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current || !bgRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const targetX = Math.round(x * 24);
    const targetY = Math.round(y * 20);

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${-targetX}px, ${-targetY}px, 0) scale(1.08)`;
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    if (bgRef.current) {
      bgRef.current.style.transform = "translate3d(0px, 0px, 0) scale(1.08)";
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden border-b border-[#2b303c]/70 bg-[#0d0e15] py-20 sm:py-28"
    >
      {/* Parallax Background Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={bgRef}
          style={{
            transform: "translate3d(0px, 0px, 0) scale(1.08)",
            transition: "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
          className="relative w-full h-full will-change-transform"
        >
          {/* Responsive Picture: Downloads ONLY the appropriate image for device form factor in modern WebP */}
          <picture className="absolute inset-0 w-full h-full">
            {/* Portrait / Phone User Background: Solitary Snow Path (WebP or JPG fallback) */}
            <source
              media="(max-width: 639px) and (orientation: portrait)"
              type="image/webp"
              srcSet="/images/fang-yuan-snow.webp"
            />
            <source
              media="(max-width: 639px) and (orientation: portrait)"
              srcSet="/images/fang-yuan-snow.jpg"
            />
            {/* Landscape / Desktop Background: Creation of Gu (WebP or PNG fallback) */}
            <source
              type="image/webp"
              srcSet="/images/fang-yuan-creation.webp"
            />
            <img
              src="/images/fang-yuan-creation.png"
              alt="The Creation of Gu — Fang Yuan Demonic Rebirth"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.08]"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          </picture>
        </div>

        {/* Precision dark matte vignette to emphasize typography and artwork atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11121c] via-[#0d0e15]/40 to-black/30" />

        {/* Soft bottom edge blend */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#11121c] to-transparent" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Riced Tag Pill */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#3b4252] bg-[#141622]/90 px-3.5 py-1 text-[11px] font-mono tracking-[0.2em] uppercase text-[#74c7ec] mb-7 shadow-sm backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#89b4fa]" />
          <span>Gu Zhenren · 蛊真人 · 宿命之争</span>
        </div>

        {/* Primary Heading */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
          Reverend Insanity
        </h1>

        {/* Subtitle Monogram */}
        <p className="font-mono text-xs sm:text-sm text-[#89b4fa] tracking-[0.35em] uppercase font-medium mb-8">
          蛊真人 · MASTER OF GU
        </p>

        {/* Iconic Opening Verse */}
        <div className="mx-auto max-w-2xl mb-8 px-4">
          <p className="font-serif italic text-lg sm:text-xl text-[#f5e0dc] leading-relaxed drop-shadow-sm">
            &ldquo;Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth.&rdquo;
          </p>
        </div>

        {/* Concise Atmospheric Premise */}
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#bac2de] leading-relaxed mb-10 drop-shadow">
          Five centuries of demonic cultivation end in encirclement. Activating the supreme Spring Autumn Cicada,
          Fang Yuan reverses temporal flow 500 years into the past—indifferent to worldly morality, relentlessly pursuing eternal life.
        </p>

        {/* Unified Riced Action Deck */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Link
            href="/read"
            className="group inline-flex items-center space-x-2 rounded-md bg-[#89b4fa] px-6 py-3 text-xs font-mono font-semibold tracking-wider uppercase text-[#11111b] shadow-md hover:bg-[#b4befe] transition-all focus:outline-none focus:ring-2 focus:ring-[#89b4fa]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Start Reading</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="#synopsis"
            className="inline-flex items-center space-x-1.5 rounded-md border border-[#3b4252] bg-[#141622]/80 px-5 py-3 text-xs font-mono tracking-wider uppercase text-[#cdd6f4] hover:border-[#89b4fa]/50 hover:bg-[#1e1e2e] backdrop-blur-md transition-all"
          >
            <span>Synopsis</span>
          </Link>

          <a
            href="https://discord.gg/YbwBb6DjXH"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-2 rounded-md border border-[#5865F2]/40 bg-[#5865F2]/10 px-5 py-3 text-xs font-mono tracking-wide text-[#cdd6f4] hover:border-[#5865F2] hover:bg-[#5865F2]/20 hover:text-white backdrop-blur-md transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#a6e3a1]" />
            <svg className="h-3.5 w-3.5 text-[#89b4fa] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Alliance Discord</span>
          </a>
        </div>

        {/* Riced Telemetry HUD Bar */}
        <div className="mx-auto max-w-3xl rounded-lg border border-[#2b303c] bg-[#12141f]/90 p-4 backdrop-blur-md shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#2b303c] text-left">
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#74c7ec]">Author</span>
              <span className="mt-0.5 block text-xs font-medium text-[#cdd6f4]">Gu Zhenren (蛊真人)</span>
            </div>
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#74c7ec]">Genre</span>
              <span className="mt-0.5 block text-xs font-medium text-[#cdd6f4]">Dark Xianxia</span>
            </div>
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#74c7ec]">Protagonist</span>
              <span className="mt-0.5 block text-xs font-medium text-[#cdd6f4]">Fang Yuan (方源)</span>
            </div>
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#74c7ec]">Canon</span>
              <span className="mt-0.5 block font-mono text-xs font-medium text-[#89b4fa]">2,334 Chapters</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
