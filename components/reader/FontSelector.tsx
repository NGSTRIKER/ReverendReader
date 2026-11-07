"use client";

import React, { useEffect, useState } from "react";
import { ReaderSettings } from "@/types/novel";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { DEFAULT_SETTINGS } from "@/lib/storage";
import {
  ThemeChoice,
  applyThemeChoice,
  readThemeChoice,
} from "@/lib/theme";

interface FontSelectorProps {
  settings: ReaderSettings;
  onChangeSettings: (settings: Partial<ReaderSettings>) => void;
}

export function FontSelector({ settings, onChangeSettings }: FontSelectorProps) {
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    setThemeChoice(readThemeChoice());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ThemeChoice>).detail;
      if (detail) setThemeChoice(detail);
    };
    window.addEventListener("reverend:theme", handler);
    return () => window.removeEventListener("reverend:theme", handler);
  }, []);

  const handleSelectTheme = (next: ThemeChoice) => {
    setThemeChoice(next);
    applyThemeChoice(next);
  };

  return (
    <div className="space-y-6">
      {/* Color Palette / Mode */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="label">Color Palette</span>
          <span className="text-xs text-muted">Light (White &amp; Red) / Dark (Night &amp; Blue)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light" as const, label: "Light", sub: "White & Red", swatch: "bg-[#ffffff] border-[#be1228]" },
            { id: "dark" as const, label: "Dark", sub: "Night & Blue", swatch: "bg-[#0b0e14] border-[#5c98ff]" },
            { id: "system" as const, label: "System", sub: "Match OS", swatch: "bg-sunken border-line-strong" },
          ].map((item) => {
            const active = themeChoice === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTheme(item.id)}
                className={`flex items-center gap-2.5 rounded-[3px] border p-2.5 text-left transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-ink"
                    : "border-line-strong bg-paper text-muted hover:text-ink"
                }`}
              >
                <span className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${item.swatch}`} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-ink">{item.label}</div>
                  <div className="text-[11px] text-muted truncate">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="reader-font-size" className="label">
            Type Size
          </label>
          <span className="text-xs font-medium text-accent tnum">{settings.fontSize}px</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
            disabled={settings.fontSize <= 14}
            className="btn-quiet p-2"
            aria-label="Decrease font size"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            id="reader-font-size"
            type="range"
            min="14"
            max="28"
            step="1"
            value={settings.fontSize}
            onChange={(e) => onChangeSettings({ fontSize: parseInt(e.target.value, 10) })}
            className="flex-1 cursor-pointer h-1.5 bg-line-strong rounded appearance-none"
          />
          <button
            type="button"
            onClick={() => onChangeSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
            disabled={settings.fontSize >= 28}
            className="btn-quiet p-2"
            aria-label="Increase font size"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Line Spacing */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="reader-line-height" className="label">
            Line Leading
          </label>
          <span className="text-xs font-medium text-accent tnum">
            {settings.lineHeight.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-2.5">
          <button
            type="button"
            onClick={() =>
              onChangeSettings({
                lineHeight: Math.max(1.3, Number((settings.lineHeight - 0.05).toFixed(2))),
              })
            }
            disabled={settings.lineHeight <= 1.3}
            className="btn-quiet p-2"
            aria-label="Decrease line spacing"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            id="reader-line-height"
            type="range"
            min="1.30"
            max="2.60"
            step="0.05"
            value={settings.lineHeight}
            onChange={(e) => onChangeSettings({ lineHeight: parseFloat(e.target.value) })}
            className="flex-1 cursor-pointer h-1.5 bg-line-strong rounded appearance-none"
          />
          <button
            type="button"
            onClick={() =>
              onChangeSettings({
                lineHeight: Math.min(2.6, Number((settings.lineHeight + 0.05).toFixed(2))),
              })
            }
            disabled={settings.lineHeight >= 2.6}
            className="btn-quiet p-2"
            aria-label="Increase line spacing"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Tight", value: 1.5 },
            { label: "Compact", value: 1.65 },
            { label: "Book", value: 1.85 },
            { label: "Open", value: 2.1 },
          ].map((item) => {
            const active = Math.abs(settings.lineHeight - item.value) < 0.04;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onChangeSettings({ lineHeight: item.value })}
                className={`rounded-[3px] border py-1.5 px-2 text-xs transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-ink font-medium"
                    : "border-line-strong bg-paper text-muted hover:text-ink"
                }`}
              >
                <span className="block">{item.label}</span>
                <span className="block text-[10px] text-faint tnum">{item.value.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="reader-letter-spacing" className="label">
            Tracking
          </label>
          <span className="text-xs font-medium text-accent tnum">
            {(settings.letterSpacing ?? 0) > 0
              ? `+${(settings.letterSpacing ?? 0).toFixed(2)}px`
              : `${(settings.letterSpacing ?? 0).toFixed(2)}px`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Normal", value: 0 },
            { label: "Loose", value: 0.2 },
            { label: "Wide", value: 0.5 },
            { label: "Open", value: 1.0 },
          ].map((item) => {
            const active = Math.abs((settings.letterSpacing ?? 0) - item.value) < 0.06;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onChangeSettings({ letterSpacing: item.value })}
                className={`rounded-[3px] border py-1.5 px-2 text-xs transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-ink font-medium"
                    : "border-line-strong bg-paper text-muted hover:text-ink"
                }`}
              >
                <span className="block">{item.label}</span>
                <span className="block text-[10px] text-faint tnum">{item.value}px</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reading Measure (Column Width) */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="label">Measure (Line Width)</span>
          <button
            type="button"
            onClick={() => onChangeSettings(DEFAULT_SETTINGS)}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset defaults</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Narrow", value: 600, desc: "600px" },
            { label: "Book", value: 680, desc: "680px" },
            { label: "Medium", value: 780, desc: "780px" },
            { label: "Wide", value: 920, desc: "920px" },
            { label: "Broad", value: 1120, desc: "1120px" },
            { label: "Full", value: 9999, desc: "100%" },
          ].map((item) => {
            const active = settings.maxWidth === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onChangeSettings({ maxWidth: item.value })}
                className={`flex flex-col items-center justify-center rounded-[3px] border py-2 px-1 text-xs transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-ink font-medium"
                    : "border-line-strong bg-paper text-muted hover:text-ink"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-faint tnum mt-0.5">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
