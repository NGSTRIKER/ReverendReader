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
      className="relative overflow-hidden border-b border-[#414559] bg-[#292c3c] py-20 sm:py-28"
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
            {/* Portrait / Phone User Background */}
            <source
              media="(max-width: 639px) and (orientation: portrait)"
              type="image/webp"
              srcSet="/images/fang-yuan-snow.webp"
            />
            <source
              media="(max-width: 639px) and (orientation: portrait)"
              srcSet="/images/fang-yuan-snow.jpg"
            />
            {/* Landscape / Desktop Background */}
            <source
              type="image/webp"
              srcSet="/images/fang-yuan-creation.webp"
            />
            <img
              src="/images/fang-yuan-creation.png"
              alt="The Creation of Gu — Fang Yuan Demonic Rebirth"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          </picture>
        </div>

        {/* Archcraft Minimal Matte Overlay in Catppuccin Frappe */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#292c3c] via-[#292c3c]/85 to-[#232634]/70" />

        {/* Bottom edge blend to section base */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#292c3c] to-transparent" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Archcraft Tag Pill */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#414559] bg-[#292c3c]/90 px-3.5 py-1 text-[11px] font-mono tracking-[0.2em] uppercase text-[#a5adce] mb-6 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8caaee]" />
          <span>Gu Zhenren · 蛊真人 · 宿命之争</span>
        </div>

        {/* Primary Heading - Clean, thin/medium typography without neon drop-shadows */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white mb-1">
          Reverend Insanity
        </h1>

        {/* Archcraft Signature Accent Bar */}
        <div className="w-12 h-[2px] bg-[#8caaee] mx-auto my-4" />

        {/* Subtitle Monogram */}
        <p className="font-mono text-xs sm:text-sm text-[#8caaee] tracking-[0.3em] uppercase mb-7">
          蛊真人 · MASTER OF GU
        </p>

        {/* Opening Verse */}
        <div className="mx-auto max-w-2xl mb-7 px-4">
          <p className="font-serif italic text-lg sm:text-xl text-[#c6d0f5] leading-relaxed font-normal">
            &ldquo;Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth.&rdquo;
          </p>
        </div>

        {/* Atmospheric Premise */}
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#a5adce] leading-relaxed mb-9">
          Five centuries of demonic cultivation end in encirclement. Activating the supreme Spring Autumn Cicada,
          Fang Yuan reverses temporal flow 500 years into the past—indifferent to worldly morality, relentlessly pursuing eternal life.
        </p>

        {/* Matte Action Buttons (Flat, crisp, 1px border, zero glow) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/read"
            className="group inline-flex items-center space-x-2 rounded-md bg-[#8caaee] px-6 py-2.5 text-xs font-mono font-medium tracking-wider uppercase text-[#232634] hover:bg-[#babbf1] transition-colors focus:outline-none focus:ring-1 focus:ring-[#8caaee]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Start Reading</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="#synopsis"
            className="inline-flex items-center space-x-1.5 rounded-md border border-[#414559] bg-[#292c3c] px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-[#c6d0f5] hover:bg-[#414559] hover:border-[#51576d] hover:text-white transition-colors"
          >
            <span>Synopsis</span>
          </Link>

          <a
            href="https://discord.gg/YbwBb6DjXH"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-2 rounded-md border border-[#414559] bg-[#292c3c] px-5 py-2.5 text-xs font-mono tracking-wide text-[#c6d0f5] hover:bg-[#414559] hover:border-[#51576d] hover:text-white transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#a6d189]" />
            <svg className="h-3.5 w-3.5 text-[#8caaee] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Alliance Discord</span>
          </a>
        </div>

        {/* Archcraft Telemetry HUD Bar (Flat matte, clean border) */}
        <div className="mx-auto max-w-3xl rounded-md border border-[#414559] bg-[#292c3c] p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#414559] text-left">
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#a5adce]">Author</span>
              <span className="mt-0.5 block text-xs font-medium text-[#c6d0f5]">Gu Zhenren (蛊真人)</span>
            </div>
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#a5adce]">Genre</span>
              <span className="mt-0.5 block text-xs font-medium text-[#c6d0f5]">Dark Xianxia</span>
            </div>
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#a5adce]">Protagonist</span>
              <span className="mt-0.5 block text-xs font-medium text-[#c6d0f5]">Fang Yuan (方源)</span>
            </div>
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#a5adce]">Canon</span>
              <span className="mt-0.5 block font-mono text-xs font-medium text-[#8caaee]">2,334 Chapters</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
