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

const COLOR_PRESETS: { hex: string; name: string; tag?: string }[] = [
  { hex: "#e4e8f0", name: "Matte Terminal", tag: "Default" },
  { hex: "#ffffff", name: "Crisp White" },
  { hex: "#e6d5b8", name: "Vintage Parchment" },
  { hex: "#f4ecd8", name: "Imperial Silk" },
  { hex: "#cdd6f4", name: "Catppuccin Text" },
  { hex: "#b4befe", name: "Lavender Spirit" },
  { hex: "#74c7ec", name: "Sapphire Core" },
  { hex: "#a6e3a1", name: "Jade Essence" },
  { hex: "#f9e2af", name: "Rank 9 Gold" },
  { hex: "#fab387", name: "Sunset Peach" },
  { hex: "#f5c2e7", name: "Velvet Rose" },
  { hex: "#f87171", name: "Demon Seal Red" },
];

const FONT_OPTIONS: { id: ReaderFont; label: string; preview: string; className: string; tag: string }[] = [
  { id: "mono", label: "JetBrains Mono", preview: "Terminal Engine", className: "font-mono", tag: "Terminal" },
  { id: "serif", label: "EB Garamond", preview: "Imperial Classic", className: "font-serif", tag: "Classic" },
  { id: "literary", label: "Palatino Book", preview: "Parchment Antiqua", className: "font-literary", tag: "Literary" },
  { id: "sans", label: "Modern Clean", preview: "Screen Sans", className: "font-sans", tag: "System" },
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
      font: DEFAULT_SETTINGS.font,
      fontSize: DEFAULT_SETTINGS.fontSize,
      lineHeight: DEFAULT_SETTINGS.lineHeight,
      letterSpacing: DEFAULT_SETTINGS.letterSpacing,
      maxWidth: DEFAULT_SETTINGS.maxWidth,
      fontColor: DEFAULT_SETTINGS.fontColor,
      textAlign: DEFAULT_SETTINGS.textAlign,
    });
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* OS Palette Mode */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <span className="text-accent">&gt;_</span>
            <span>Display Environment / 模式</span>
          </label>
          <span className="text-[11px] text-faint">Light (Red) · Dark (Matte Black)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light" as const, label: "Day Book", sub: "White & Red", swatch: "bg-[#ffffff] border-[#c5162a]" },
            { id: "dark" as const, label: "Matte Terminal", sub: "Black & Grey", swatch: "bg-[#0e0f12] border-[#4d8aff]" },
            { id: "system" as const, label: "System Sync", sub: "OS Match", swatch: "bg-sunken border-line-strong" },
          ].map((item) => {
            const active = themeChoice === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTheme(item.id)}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                  active
                    ? "border-accent bg-accent/10 text-ink shadow-sm"
                    : "border-line bg-sunken text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${item.swatch}`} />
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
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-accent" />
            <span>Typeface / 字体</span>
          </span>
          <span className="chinese-seal text-[10px]">字</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => {
            const active = (settings.font || DEFAULT_SETTINGS.font) === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeSettings({ font: f.id })}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-accent bg-accent/10 text-ink shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={`text-xs font-semibold text-ink ${f.className}`}>{f.label}</span>
                  <span className="text-[9px] uppercase tracking-wider text-faint border border-line rounded px-1">
                    {f.tag}
                  </span>
                </div>
                <span className="text-[11px] text-muted mt-0.5 truncate">{f.preview}</span>
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
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Size / 字号
            </label>
            <span className="text-xs font-medium text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              {settings.fontSize}px
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
              disabled={settings.fontSize <= 14}
              className="btn-quiet h-8 w-8 p-0 rounded-lg flex items-center justify-center"
              aria-label="Decrease font size"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min="14"
              max="32"
              step="1"
              value={settings.fontSize}
              onChange={(e) => onChangeSettings({ fontSize: parseInt(e.target.value, 10) })}
              className="flex-1 cursor-pointer h-1.5 bg-line-strong rounded-lg appearance-none accent-accent"
            />
            <button
              type="button"
              onClick={() => onChangeSettings({ fontSize: Math.min(32, settings.fontSize + 1) })}
              disabled={settings.fontSize >= 32}
              className="btn-quiet h-8 w-8 p-0 rounded-lg flex items-center justify-center"
              aria-label="Increase font size"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Line Spacing / 行高
            </label>
            <span className="text-xs font-medium text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
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
              className="btn-quiet h-8 w-8 p-0 rounded-lg flex items-center justify-center"
              aria-label="Decrease line height"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min="1.3"
              max="2.6"
              step="0.05"
              value={settings.lineHeight}
              onChange={(e) => onChangeSettings({ lineHeight: parseFloat(e.target.value) })}
              className="flex-1 cursor-pointer h-1.5 bg-line-strong rounded-lg appearance-none accent-accent"
            />
            <button
              type="button"
              onClick={() =>
                onChangeSettings({
                  lineHeight: Math.min(2.6, parseFloat((settings.lineHeight + 0.05).toFixed(2))),
                })
              }
              disabled={settings.lineHeight >= 2.6}
              className="btn-quiet h-8 w-8 p-0 rounded-lg flex items-center justify-center"
              aria-label="Increase line height"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Letter Spacing & Text Align */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Letter Spacing */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Letter Spacing / 字间距
            </label>
            <span className="text-xs font-medium text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              {typeof settings.letterSpacing === "number" ? settings.letterSpacing.toFixed(1) : "0.2"}px
            </span>
          </div>
          <input
            type="range"
            min="-0.5"
            max="2.5"
            step="0.1"
            value={typeof settings.letterSpacing === "number" ? settings.letterSpacing : 0.2}
            onChange={(e) => onChangeSettings({ letterSpacing: parseFloat(e.target.value) })}
            className="w-full cursor-pointer h-1.5 bg-line-strong rounded-lg appearance-none accent-accent"
          />
        </div>

        {/* Text Alignment */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5 block">
            Alignment / 对齐
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeSettings({ textAlign: "left" })}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs transition-colors ${
                settings.textAlign !== "justify"
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-line bg-sunken text-muted hover:text-ink"
              }`}
            >
              <AlignLeft className="h-3.5 w-3.5" />
              <span>Left</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeSettings({ textAlign: "justify" })}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs transition-colors ${
                settings.textAlign === "justify"
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-line bg-sunken text-muted hover:text-ink"
              }`}
            >
              <AlignJustify className="h-3.5 w-3.5" />
              <span>Justify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Font Color Customization & Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-accent" />
            <span>Font Color Customization / 字体颜色</span>
          </label>
          <span className="text-[10px] text-faint">Custom Hex or Preset</span>
        </div>

        {/* Hex Input Bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center rounded-xl border border-line bg-sunken px-3 py-1.5 focus-within:border-accent">
            <span className="text-xs text-muted mr-1.5">#</span>
            <input
              type="text"
              value={hexInput.startsWith("#") ? hexInput.slice(1) : hexInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                handleHexInputChange({
                  target: { value: `#${raw}` },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              placeholder="e4e8f0"
              className="w-full bg-transparent text-xs uppercase text-ink focus:outline-none"
              maxLength={6}
            />
          </div>
          <div
            className="h-8 w-8 rounded-xl border border-line flex-shrink-0 shadow-inner"
            style={{ backgroundColor: currentFontColor }}
            title={`Active: ${currentFontColor}`}
          />
        </div>

        {/* Preset Color Swatches */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = currentFontColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChangeSettings({ fontColor: preset.hex })}
                title={`${preset.name} (${preset.hex})`}
                className={`group flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-center transition-all ${
                  isSelected
                    ? "border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken hover:border-line-strong hover:bg-surface"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-sm mb-1 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && <Check className="h-2 w-2 text-black font-bold" />}
                </span>
                <span
                  className="text-[10px] font-medium truncate max-w-full px-0.5"
                  style={{ color: preset.hex }}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Typography Preview */}
        <div className="mt-3.5 rounded-xl border border-line bg-sunken/80 p-3.5 text-center">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted mb-2">
            <span>&gt;_ Live Preview</span>
            <span className="chinese-seal text-[9px]">方源 · 诗</span>
          </div>
          <p
            className={`transition-colors duration-150 ${
              settings.font === "mono"
                ? "font-mono"
                : settings.font === "sans"
                ? "font-sans"
                : settings.font === "literary"
                ? "font-literary"
                : "font-serif"
            } ${settings.textAlign === "justify" ? "text-justify" : "text-center"}`}
            style={{
              color: currentFontColor,
              fontSize: `${Math.min(18, Math.max(14, settings.fontSize - 2))}px`,
              lineHeight: settings.lineHeight,
              letterSpacing:
                typeof settings.letterSpacing === "number" ? `${settings.letterSpacing}px` : "0.2px",
            }}
          >
            “人是万物之灵，蛊是天地之精。”
            <br />
            “Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth.”
          </p>
        </div>
      </div>

      {/* Reading Width Options */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-accent" />
            <span>Reading Canvas Width / 页面宽度</span>
          </span>
          <span className="text-[10px] text-faint">Responsive Columns</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {WIDTH_OPTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChangeSettings({ maxWidth: item.value })}
              className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-xs transition-all ${
                settings.maxWidth === item.value
                  ? "border-accent bg-accent/15 text-ink font-semibold shadow-sm ring-1 ring-accent/30"
                  : "border-line bg-sunken text-muted hover:text-ink hover:border-line-strong"
              }`}
            >
              <span className="font-medium truncate text-ink">{item.label}</span>
              <span className="text-[10px] text-muted mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Defaults */}
      <div className="pt-2 border-t border-line flex justify-between items-center">
        <span className="text-[11px] text-muted">Restore default typesetting</span>
        <button
          type="button"
          onClick={handleReset}
          className="btn-quiet text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
}
