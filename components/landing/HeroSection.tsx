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
          <Image
            src="/images/fang-yuan-creation.png"
            alt="The Creation of Gu — Fang Yuan Demonic Rebirth"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.70] contrast-[1.10]"
          />
        </div>

        {/* Catppuccin Blue & Mocha Tint Overlays for Crystal Readability */}
        {/* Layer 1: Base color tint */}
        <div className="absolute inset-0 bg-[#1e1e2e]/80 mix-blend-multiply" />

        {/* Layer 2: Directional vignette and gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-[#1e1e2e]/75 to-[#181825]/65" />

        {/* Layer 3: Subtle Catppuccin Blue ambient radial glow */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 30%, rgba(137, 180, 250, 0.25) 0%, rgba(30, 30, 46, 0) 75%)",
          }}
        />

        {/* Layer 4: Delicate frosted blur */}
        <div className="absolute inset-0 backdrop-blur-[1.5px]" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8 text-center">
        {/* Cultural Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#89b4fa]/40 bg-[#181825]/90 px-4 py-1.5 text-xs text-[#89b4fa] font-medium tracking-widest uppercase mb-8 shadow-lg shadow-black/40 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-[#89b4fa] animate-pulse" />
          <span>Daoist Gu Epic · 蛊真人 · 宿命之争</span>
        </div>

        {/* Primary Heading */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#cdd6f4] mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          Reverend Insanity
        </h1>

        {/* Secondary Title */}
        <p className="font-serif text-xl sm:text-2xl text-[#89b4fa] tracking-widest uppercase font-light mb-8 drop-shadow-md">
          Daoist Gu · 蛊真人
        </p>

        {/* Philosophical Hook Quote */}
        <blockquote className="mx-auto max-w-2xl border-l-2 border-[#89b4fa] pl-4 text-left sm:text-center sm:border-l-0 sm:pl-0 mb-8">
          <p className="font-serif italic text-lg sm:text-xl text-[#cdd6f4] leading-relaxed drop-shadow-sm">
            &ldquo;Humans are the spirit of all living beings, Gu are the essence of heaven and earth.&rdquo;
          </p>
        </blockquote>

        {/* Original Synopsis Teaser */}
        <p className="mx-auto max-w-3xl text-base sm:text-lg text-[#bac2de] leading-relaxed mb-10 drop-shadow">
          Five centuries of bloodshed, calculated sacrifice, and ruthless cultivation ended in encirclement.
          Using the forbidden Spring Autumn Cicada, Fang Yuan reverses temporal flow to his youth.
          Unbound by conventional morality and indifferent to the praise or condemnation of mortals, he embarks
          once more on the solitary quest for eternal life.
        </p>

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
            <span>Story & Themes</span>
          </Link>

          <Link
            href="#artwork"
            className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded border border-[#45475a] bg-[#181825]/90 px-7 py-3.5 text-sm font-medium tracking-wider uppercase text-[#cdd6f4] hover:bg-[#313244] hover:text-white backdrop-blur-md transition-colors"
          >
            <span>Art Gallery</span>
          </Link>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#313244]/80 pt-10 text-left bg-[#181825]/60 rounded-xl p-6 backdrop-blur-md border">
          <div>
            <span className="block text-xs uppercase tracking-widest text-[#a6adc8]">Author</span>
            <span className="mt-1 font-serif text-sm font-medium text-[#cdd6f4]">Gu Zhen Ren (蛊真人)</span>
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
