"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

export function HeroSection() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement | null>(null);

  // Parallax mouse movement handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    // Normalized coordinates from -1 to 1 based on center of hero section
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // Dampen movement range to 30px maximum
    setOffset({
      x: Math.round(x * 28),
      y: Math.round(y * 24),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Smoothly return to center when mouse leaves
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden border-b border-[#313244]/80 bg-[#181825] py-24 sm:py-32"
    >
      {/* Parallax Background Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0) scale(1.10)`,
            transition: "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
          className="relative w-full h-full will-change-transform"
        >
          {/* Landscape / Desktop Background: Creation of Gu (Full Quality Uncompressed) */}
          <div className="hidden sm:landscape:block sm:block landscape:block absolute inset-0">
            <Image
              src="/images/fang-yuan-creation.png"
              alt="The Creation of Gu — Fang Yuan Demonic Rebirth"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.92] contrast-[1.05]"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          </div>

          {/* Portrait / Phone User Background: Solitary Snow Path (Full Quality Uncompressed) */}
          <div className="block sm:landscape:hidden sm:hidden landscape:hidden absolute inset-0">
            <Image
              src="/images/fang-yuan-snow.jpg"
              alt="Fang Yuan walking through snowy plum blossoms"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-top filter brightness-[0.92] contrast-[1.05]"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          </div>
        </div>

        {/* Lightweight subtle vignette tint so the artwork is vivid and clear */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-[#1e1e2e]/35 to-black/20" />

        {/* Soft bottom transition blend into next section */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#1e1e2e] to-transparent" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8 text-center">
        {/* Cultural Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#89b4fa]/40 bg-[#181825]/90 px-4 py-1.5 text-xs text-[#89b4fa] font-medium tracking-widest uppercase mb-8 shadow-lg shadow-black/40 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-[#89b4fa] animate-pulse" />
          <span>Gu Zhenren Epic · 蛊真人 · 宿命之争</span>
        </div>

        {/* Primary Heading */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#cdd6f4] mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          Reverend Insanity
        </h1>

        {/* Secondary Title */}
        <p className="font-serif text-xl sm:text-2xl text-[#89b4fa] tracking-widest uppercase font-light mb-8 drop-shadow-md">
          Gu Zhenren · 蛊真人
        </p>

        {/* Iconic Opening Quote */}
        <blockquote className="mx-auto max-w-2xl border-l-2 border-[#89b4fa] pl-4 text-left sm:text-center sm:border-l-0 sm:pl-0 mb-8">
          <p className="font-serif italic text-lg sm:text-xl text-[#cdd6f4] leading-relaxed drop-shadow-sm">
            &ldquo;Humans are the spirit of all living beings, Gu are the essence of heaven and earth.&rdquo;
          </p>
        </blockquote>

        {/* Concise Premise Teaser */}
        <p className="mx-auto max-w-3xl text-base sm:text-lg text-[#bac2de] leading-relaxed mb-8 drop-shadow">
          Five centuries of demonic cultivation, bloodshed, and solitary perseverance ended in encirclement.
          Using the supreme Spring Autumn Cicada, Fang Yuan reverses temporal flow 500 years into the past.
          Unbound by conventional morality and indifferent to worldly judgments, he embarks once more on his relentless pursuit of eternal life.
        </p>

        {/* Discord Server Invite Banner */}
        <div className="mx-auto max-w-2xl mb-10">
          <a
            href="https://discord.gg/YbwBb6DjXH"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-2.5 rounded-full border border-[#5865F2]/50 bg-[#181825]/90 px-5 py-2 text-xs font-medium text-[#cdd6f4] shadow-lg shadow-[#5865F2]/10 backdrop-blur-md hover:border-[#5865F2] hover:bg-[#5865F2]/20 hover:text-white transition-all"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#a6e3a1] animate-ping" />
            <svg className="h-4 w-4 text-[#89b4fa] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="font-semibold tracking-wide">
              Heaven And Earth Great Love Alliance • Reverend Insanity [ 蛊真人 ]
            </span>
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/read"
            className="group flex w-full sm:w-auto items-center justify-center space-x-3 rounded bg-[#89b4fa] px-8 py-3.5 text-sm font-semibold tracking-wider uppercase text-[#11111b] shadow-xl shadow-[#89b4fa]/20 hover:bg-[#b4befe] transition-all focus:outline-none focus:ring-2 focus:ring-[#89b4fa] focus:ring-offset-2 focus:ring-offset-[#1e1e2e]"
          >
            <BookOpen className="h-4 w-4" />
            <span>Start Reading Chapter 1</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="#synopsis"
            className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded border border-[#45475a] bg-[#181825]/90 px-7 py-3.5 text-sm font-medium tracking-wider uppercase text-[#cdd6f4] hover:bg-[#313244] hover:text-white backdrop-blur-md transition-colors"
          >
            <span>Read Synopsis</span>
          </Link>

          <a
            href="https://discord.gg/YbwBb6DjXH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded border border-[#5865F2]/60 bg-[#5865F2]/20 px-6 py-3.5 text-sm font-medium tracking-wider text-[#cdd6f4] hover:bg-[#5865F2] hover:text-white backdrop-blur-md transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Discord Server</span>
          </a>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#313244]/80 pt-10 text-left bg-[#181825]/60 rounded-xl p-6 backdrop-blur-md border">
          <div>
            <span className="block text-xs uppercase tracking-widest text-[#a6adc8]">Author</span>
            <span className="mt-1 font-serif text-sm font-medium text-[#cdd6f4]">Gu Zhenren (蛊真人)</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest text-[#a6adc8]">Genre</span>
            <span className="mt-1 font-serif text-sm font-medium text-[#cdd6f4]">Dark Xianxia / Fantasy</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest text-[#a6adc8]">Protagonist</span>
            <span className="mt-1 font-serif text-sm font-medium text-[#cdd6f4]">Fang Yuan (方源)</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest text-[#a6adc8]">Scope</span>
            <span className="mt-1 font-serif text-sm font-medium text-[#89b4fa]">2,334 Chapters</span>
          </div>
        </div>
      </div>
    </section>
  );
}
