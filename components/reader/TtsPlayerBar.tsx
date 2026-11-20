"use client";

import React from "react";
import { ENGLISH_VOICES, type ParadeeVoice } from "@/lib/tts/paradee";
import type { TtsStatus } from "@/lib/tts/useParadeeTts";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Loader2,
  Volume2,
  AlertCircle,
} from "lucide-react";

interface TtsPlayerBarProps {
  isOpen: boolean;
  status: TtsStatus;
  error: string | null;
  voice: ParadeeVoice;
  speed: number;
  currentIndex: number;
  totalSentences: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onChangeVoice: (voice: ParadeeVoice) => void;
  onChangeSpeed: (speed: number) => void;
  onClose: () => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.15, 1.25, 1.5, 1.75, 2];

export function TtsPlayerBar({
  isOpen,
  status,
  error,
  voice,
  speed,
  currentIndex,
  totalSentences,
  onTogglePlay,
  onPrev,
  onNext,
  onChangeVoice,
  onChangeSpeed,
  onClose,
}: TtsPlayerBarProps) {
  if (!isOpen) return null;

  const isBusy = status === "loading-model" || status === "synthesizing";
  const isPlaying = status === "playing";

  let statusText = `${Math.min(currentIndex + 1, Math.max(1, totalSentences))} / ${totalSentences}`;
  if (status === "loading-model") statusText = "Loading Paradee 1.3…";
  else if (status === "synthesizing") statusText = "Synthesizing…";
  else if (status === "error") statusText = error || "TTS error";

  return (
    <div
      role="region"
      aria-label="Read aloud player"
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.25rem)] max-w-2xl font-mono"
    >
      <div className="rounded-2xl border border-line-strong bg-surface/95 backdrop-blur-md shadow-pop px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex <= 0 || isBusy}
            aria-label="Previous sentence"
            title="Previous sentence"
            className="icon-btn rounded-xl h-8 w-8 disabled:opacity-40"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            disabled={totalSentences === 0}
            aria-label={isPlaying ? "Pause reading" : "Play reading"}
            title={isPlaying ? "Pause" : "Play"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-on-accent hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={currentIndex >= totalSentences - 1 || isBusy}
            aria-label="Next sentence"
            title="Next sentence"
            className="icon-btn rounded-xl h-8 w-8 disabled:opacity-40"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Status / Progress */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 px-1">
          {status === "error" ? (
            <AlertCircle className="h-3.5 w-3.5 text-danger flex-shrink-0" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-accent flex-shrink-0 hidden sm:inline" />
          )}
          <span
            className={`text-[11px] truncate tabular-nums ${
              status === "error" ? "text-danger" : "text-muted"
            }`}
            title={statusText}
          >
            {statusText}
          </span>
        </div>

        {/* Voice, Speed & Close */}
        <div className="flex items-center gap-1.5">
          <label className="sr-only" htmlFor="tts-voice-select">
            Voice
          </label>
          <select
            id="tts-voice-select"
            value={voice}
            onChange={(e) => onChangeVoice(e.target.value as ParadeeVoice)}
            aria-label="TTS voice"
            title="Select Paradee voice"
            className="h-8 rounded-xl border border-line bg-paper px-2 text-[11px] text-ink focus:outline-none focus:border-accent"
          >
            {ENGLISH_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} ({v.accent.split(" ")[0]})
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="tts-speed-select">
            Speed
          </label>
          <select
            id="tts-speed-select"
            value={speed}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            aria-label="TTS playback speed"
            title="Playback speed"
            className="h-8 rounded-xl border border-line bg-paper px-1.5 text-[11px] text-ink tabular-nums focus:outline-none focus:border-accent"
          >
            {SPEED_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close read aloud player"
            title="Close read aloud"
            className="icon-btn rounded-xl h-8 w-8 text-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
