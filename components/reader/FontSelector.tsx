"use client";

import React, { useEffect, useState } from "react";
import { ReaderSettings, ReaderFont } from "@/types/novel";
import {
  Type,
  Minus,
  Plus,
  RotateCcw,
  Palette,
  Check,
  AlignLeft,
  AlignJustify,
  Maximize2,
} from "lucide-react";
import { DEFAULT_SETTINGS, getReaderFontClass } from "@/lib/storage";
import {
  ThemeChoice,
  applyThemeChoice,
  readThemeChoice,
} from "@/lib/theme";

interface FontSelectorProps {
  settings: ReaderSettings;
  onChangeSettings: (settings: Partial<ReaderSettings>) => void;
}

const COLOR_PRESETS: { hex: string; name: string; tag?: string; lightSwatch?: boolean }[] = [
  { hex: "#e4e8f0", name: "Auto Ink", tag: "Adaptive" },
  { hex: "#181714", name: "Deep Ink", lightSwatch: false },
  { hex: "#4a3525", name: "Warm Sepia", lightSwatch: false },
  { hex: "#ffffff", name: "Crisp White", lightSwatch: true },
  { hex: "#e6d5b8", name: "Aged Cream", lightSwatch: true },
  { hex: "#f4ecd8", name: "Warm Silk", lightSwatch: true },
  { hex: "#cdd6f4", name: "Moonlight Mist", lightSwatch: true },
  { hex: "#74c7ec", name: "Sky Cerulean", lightSwatch: true },
  { hex: "#a6e3a1", name: "Jade Mist", lightSwatch: true },
  { hex: "#f9e2af", name: "Amber Ochre", lightSwatch: true },
  { hex: "#fab387", name: "Peach Sand", lightSwatch: true },
  { hex: "#f5c2e7", name: "Lotus Tint", lightSwatch: true },
];

const FONT_OPTIONS: { id: ReaderFont; label: string; preview: string; className: string; tag: string }[] = [
  { id: "serif", label: "Bookerly", preview: "Kindle Literary", className: "font-serif", tag: "Book" },
  { id: "literary", label: "Literata", preview: "Editorial Serif", className: "font-literary", tag: "Literary" },
  { id: "sans", label: "DM Sans", preview: "Clean Interface", className: "font-sans", tag: "Sans" },
  { id: "bellota", label: "Bellota", preview: "Flowing Artisan", className: "font-bellota", tag: "Artisan" },
  { id: "mono", label: "JetBrains Mono", preview: "Fixed Width", className: "font-mono", tag: "Mono" },
  { id: "dyslexic", label: "OpenDyslexic", preview: "Dyslexia Friendly", className: "font-dyslexic", tag: "Access" },
];

const WIDTH_OPTIONS = [
  { label: "Narrow", value: 680, desc: "680px" },
  { label: "Standard", value: 760, desc: "760px" },
  { label: "Wide", value: 880, desc: "880px" },
  { label: "Extended", value: 1100, desc: "1100px" },
  { label: "Ultra", value: 1440, desc: "1440px" },
  { label: "Full Canvas", value: 9999, desc: "100%" },
];

export function FontSelector({ settings, onChangeSettings }: FontSelectorProps) {
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("system");
  const currentFontColor = settings.fontColor || "#e4e8f0";
  const [hexInput, setHexInput] = useState<string>(currentFontColor);

  useEffect(() => {
    setThemeChoice(readThemeChoice());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ThemeChoice>).detail;
      if (detail) setThemeChoice(detail);
    };
    window.addEventListener("reverend:theme", handler);
    return () => window.removeEventListener("reverend:theme", handler);
  }, []);

  useEffect(() => {
    setHexInput(settings.fontColor || "#e4e8f0");
  }, [settings.fontColor]);

  const handleSelectTheme = (next: ThemeChoice) => {
    setThemeChoice(next);
    applyThemeChoice(next);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setHexInput(val);
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onChangeSettings({ fontColor: val });
    }
  };

  const handleReset = () => {
    onChangeSettings({
      font: "serif",
      fontSize: DEFAULT_SETTINGS.fontSize,
      lineHeight: DEFAULT_SETTINGS.lineHeight,
      letterSpacing: DEFAULT_SETTINGS.letterSpacing,
      maxWidth: DEFAULT_SETTINGS.maxWidth,
      fontColor: DEFAULT_SETTINGS.fontColor,
      textAlign: DEFAULT_SETTINGS.textAlign,
    });
  };

  // #e4e8f0 is the Auto Ink sentinel; any other hex overrides the surface's --ink token
  const isAutoInkColor = currentFontColor.toLowerCase() === "#e4e8f0";

  return (
    <div className="space-y-6 font-sans text-sm">
      {/* Appearance Mode */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p
            id="appearance-mode-label"
            className="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Appearance
          </p>
          <span className="text-xs text-muted">Theme Mode</span>
        </div>
        <div
          role="radiogroup"
          aria-labelledby="appearance-mode-label"
          className="grid grid-cols-3 gap-1.5 sm:gap-2"
        >
          {[
            { id: "light" as const, label: "Day Paper", sub: "Warm Paper", swatch: "bg-[#faf8f3] border-[#af1d27]" },
            { id: "dark" as const, label: "Night Charcoal", sub: "Dark Paper", swatch: "bg-[#0d0f0e] border-[#d0be94]" },
            { id: "system" as const, label: "System", sub: "Auto Match", swatch: "bg-sunken border-line-strong" },
          ].map((item) => {
            const active = themeChoice === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleSelectTheme(item.id)}
                className={`flex min-h-[48px] items-center gap-1.5 sm:gap-2 rounded-xl border p-2.5 text-left transition-all ${
                  active
                    ? "border-accent bg-accent/10 text-ink shadow-sm"
                    : "border-line bg-sunken text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${item.swatch}`} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-ink truncate">{item.label}</div>
                  <div className="text-[10px] text-muted truncate">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typeface Selection */}
      <div>
        <p
          id="typeface-group-label"
          className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5"
        >
          <Type className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>Typeface</span>
        </p>
        <div
          role="radiogroup"
          aria-labelledby="typeface-group-label"
          className="grid grid-cols-2 gap-2"
        >
          {FONT_OPTIONS.map((f, index) => {
            const active = (settings.font || "serif") === f.id;
            const spanLastOdd =
              FONT_OPTIONS.length % 2 === 1 && index === FONT_OPTIONS.length - 1
                ? "col-span-2"
                : "";
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChangeSettings({ font: f.id })}
                className={`flex min-h-[56px] flex-col items-start justify-center rounded-xl border p-3 text-left transition-all ${spanLastOdd} ${
                  active
                    ? "border-accent bg-accent/10 text-ink shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className={`text-sm font-semibold text-ink ${f.className}`}>{f.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted border border-line rounded px-1.5 py-0.5">
                    {f.tag}
                  </span>
                </div>
                <span className="text-xs text-muted mt-0.5 truncate">{f.preview}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size & Line Height Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Font Size */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="font-size-range"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Font Size
            </label>
            <span className="font-mono text-xs font-medium text-accent tnum bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              {settings.fontSize}px
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
              disabled={settings.fontSize <= 14}
              className="btn-quiet h-11 w-11 sm:h-9 sm:w-9 p-0 rounded-xl flex items-center justify-center flex-shrink-0"
              aria-label="Decrease font size"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <input
              id="font-size-range"
              type="range"
              min="14"
              max="32"
              step="1"
              value={settings.fontSize}
              onChange={(e) => onChangeSettings({ fontSize: parseInt(e.target.value, 10) })}
              aria-label="Font size in pixels"
              className="flex-1 cursor-pointer h-2 bg-line-strong rounded-lg appearance-none accent-accent"
            />
            <button
              type="button"
              onClick={() => onChangeSettings({ fontSize: Math.min(32, settings.fontSize + 1) })}
              disabled={settings.fontSize >= 32}
              className="btn-quiet h-11 w-11 sm:h-9 sm:w-9 p-0 rounded-xl flex items-center justify-center flex-shrink-0"
              aria-label="Increase font size"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="line-height-range"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Line Height
            </label>
            <span className="font-mono text-xs font-medium text-accent tnum bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              {settings.lineHeight.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onChangeSettings({
                  lineHeight: Math.max(1.3, parseFloat((settings.lineHeight - 0.05).toFixed(2))),
                })
              }
              disabled={settings.lineHeight <= 1.3}
              className="btn-quiet h-11 w-11 sm:h-9 sm:w-9 p-0 rounded-xl flex items-center justify-center flex-shrink-0"
              aria-label="Decrease line height"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <input
              id="line-height-range"
              type="range"
              min="1.3"
              max="2.6"
              step="0.05"
              value={settings.lineHeight}
              onChange={(e) => onChangeSettings({ lineHeight: parseFloat(e.target.value) })}
              aria-label="Line height multiplier"
              className="flex-1 cursor-pointer h-2 bg-line-strong rounded-lg appearance-none accent-accent"
            />
            <button
              type="button"
              onClick={() =>
                onChangeSettings({
                  lineHeight: Math.min(2.6, parseFloat((settings.lineHeight + 0.05).toFixed(2))),
                })
              }
              disabled={settings.lineHeight >= 2.6}
              className="btn-quiet h-11 w-11 sm:h-9 sm:w-9 p-0 rounded-xl flex items-center justify-center flex-shrink-0"
              aria-label="Increase line height"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Letter Spacing & Text Align */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Letter Spacing */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="letter-spacing-range"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Letter Spacing
            </label>
            <span className="font-mono text-xs font-medium text-accent tnum bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              {typeof settings.letterSpacing === "number" ? settings.letterSpacing.toFixed(1) : "0.2"}px
            </span>
          </div>
          <input
            id="letter-spacing-range"
            type="range"
            min="-0.5"
            max="2.5"
            step="0.1"
            value={typeof settings.letterSpacing === "number" ? settings.letterSpacing : 0.2}
            onChange={(e) => onChangeSettings({ letterSpacing: parseFloat(e.target.value) })}
            aria-label="Letter spacing in pixels"
            className="w-full cursor-pointer h-2 bg-line-strong rounded-lg appearance-none accent-accent"
          />
        </div>

        {/* Text Alignment */}
        <div>
          <p
            id="alignment-group-label"
            className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5"
          >
            Alignment
          </p>
          <div
            role="radiogroup"
            aria-labelledby="alignment-group-label"
            className="grid grid-cols-2 gap-2"
          >
            <button
              type="button"
              role="radio"
              aria-checked={settings.textAlign !== "justify"}
              onClick={() => onChangeSettings({ textAlign: "left" })}
              className={`flex min-h-[44px] sm:min-h-[38px] items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs transition-colors ${
                settings.textAlign !== "justify"
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-line bg-sunken text-muted hover:text-ink"
              }`}
            >
              <AlignLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Left</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.textAlign === "justify"}
              onClick={() => onChangeSettings({ textAlign: "justify" })}
              className={`flex min-h-[44px] sm:min-h-[38px] items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs transition-colors ${
                settings.textAlign === "justify"
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-line bg-sunken text-muted hover:text-ink"
              }`}
            >
              <AlignJustify className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Justify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Font Color Customization & Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="font-color-hex-input"
            className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5"
          >
            <Palette className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Text Color</span>
          </label>
          <span className="text-xs text-muted">Auto Ink or Custom Hex</span>
        </div>

        {/* Hex Input Bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex min-h-[44px] sm:min-h-[38px] items-center rounded-xl border border-line bg-sunken px-3 py-1.5 focus-within:ring-2 focus-within:ring-accent focus-within:border-accent">
            <span className="font-mono text-xs text-muted mr-1.5" aria-hidden="true">#</span>
            <input
              id="font-color-hex-input"
              type="text"
              value={hexInput.startsWith("#") ? hexInput.slice(1) : hexInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                handleHexInputChange({
                  target: { value: `#${raw}` },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              placeholder="e4e8f0"
              aria-label="Custom font color hex code"
              className="w-full bg-transparent font-mono text-base sm:text-xs uppercase text-ink focus-visible:outline-none"
              maxLength={6}
            />
          </div>
          <div
            className="h-11 w-11 sm:h-9 sm:w-9 rounded-xl border border-line flex-shrink-0 shadow-inner"
            style={
              isAutoInkColor
                ? { background: "linear-gradient(135deg, #181714 50%, #f1efe9 50%)" }
                : { backgroundColor: currentFontColor }
            }
            title={isAutoInkColor ? "Active: Auto Ink (Follows Surface)" : `Active: ${currentFontColor}`}
          />
        </div>

        {/* Preset Color Swatches */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = currentFontColor.toLowerCase() === preset.hex.toLowerCase();
            const isAutoSwatch = preset.hex === "#e4e8f0";
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChangeSettings({ fontColor: preset.hex })}
                title={isAutoSwatch ? "Auto Ink (Adapts to Paper / Surface)" : `${preset.name} (${preset.hex})`}
                aria-pressed={isSelected}
                className={`group flex min-h-[52px] flex-col items-center justify-center rounded-xl border py-2 px-1.5 text-center transition-all ${
                  isSelected
                    ? "border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken hover:border-line-strong hover:bg-surface"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-black/20 shadow-sm mb-1 flex items-center justify-center flex-shrink-0"
                  style={
                    isAutoSwatch
                      ? { background: "linear-gradient(135deg, #181714 50%, #f1efe9 50%)" }
                      : { backgroundColor: preset.hex }
                  }
                >
                  {isSelected && (
                    <Check
                      className={`h-2.5 w-2.5 font-bold ${
                        isAutoSwatch
                          ? "text-accent drop-shadow"
                          : preset.lightSwatch
                            ? "text-black"
                            : "text-white"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="text-[11px] font-medium text-ink truncate max-w-full px-0.5">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Typography & Surface Preview */}
        <div
          data-reader-surface={settings.surfaceTheme || "matte-terminal"}
          className="mt-3.5 rounded-xl border border-line bg-paper p-3.5 transition-colors"
        >
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted mb-1.5">
            Preview
          </div>
          <p
            className={`transition-colors duration-150 ${getReaderFontClass(settings.font)} ${
              settings.textAlign === "justify" ? "text-justify" : "text-left"
            } text-ink`}
            style={{
              color: isAutoInkColor ? undefined : currentFontColor,
              fontSize: `${Math.min(18, Math.max(14, settings.fontSize - 2))}px`,
              lineHeight: settings.lineHeight,
              letterSpacing:
                typeof settings.letterSpacing === "number" ? `${settings.letterSpacing}px` : "0.2px",
            }}
          >
            “Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth.”
          </p>
        </div>
      </div>

      {/* Reading Width Options (Desktop Columns) */}
      <div className="hidden sm:block">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
          <span id="page-width-label" className="flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Page Width</span>
          </span>
          <span className="text-xs text-muted">Desktop Columns</span>
        </div>
        <div
          role="radiogroup"
          aria-labelledby="page-width-label"
          className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2"
        >
          {WIDTH_OPTIONS.map((item) => {
            const active = settings.maxWidth === item.value;
            return (
              <button
                key={item.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChangeSettings({ maxWidth: item.value })}
                className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-xs transition-all ${
                  active
                    ? "border-accent bg-accent/15 text-ink font-semibold shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken text-muted hover:text-ink hover:border-line-strong"
                }`}
              >
                <span className="font-medium truncate text-ink text-xs">{item.label}</span>
                <span className="font-mono text-[10px] text-muted mt-0.5">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Defaults */}
      <div className="pt-2 border-t border-line flex justify-between items-center">
        <span className="text-xs text-muted">Restore default typesetting</span>
        <button
          type="button"
          onClick={handleReset}
          className="btn-quiet min-h-[44px] sm:min-h-[38px] text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
}
