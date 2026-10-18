"use client";

import React, { useState, useEffect } from "react";
import { ReaderSettings, ReaderFont } from "@/types/novel";
import { Type, Minus, Plus, Palette, RotateCcw, Check } from "lucide-react";

interface FontSelectorProps {
  settings: ReaderSettings;
  onChangeSettings: (settings: Partial<ReaderSettings>) => void;
}

export function FontSelector({ settings, onChangeSettings }: FontSelectorProps) {
  const currentFontColor = settings.fontColor || "#cdd6f4";
  const [hexInput, setHexInput] = useState<string>(currentFontColor);

  useEffect(() => {
    setHexInput(settings.fontColor || "#cdd6f4");
  }, [settings.fontColor]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    // If valid 6-hex or 3-hex color code
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onChangeSettings({ fontColor: val });
    }
  };

  const fontOptions: { id: ReaderFont; label: string; preview: string; className: string }[] = [
    { id: "serif", label: "Serif", preview: "Georgia Classic", className: "font-serif" },
    { id: "literary", label: "Literary", preview: "Palatino Book", className: "font-literary" },
    { id: "sans", label: "Sans", preview: "Inter System", className: "font-sans" },
    { id: "mono", label: "Mono", preview: "Clean Monospace", className: "font-mono" },
  ];

  const colorPresets: { hex: string; name: string; tag?: string }[] = [
    { hex: "#cdd6f4", name: "Catppuccin Text", tag: "Default" },
    { hex: "#89b4fa", name: "Catppuccin Blue", tag: "Blue" },
    { hex: "#b4befe", name: "Catppuccin Lavender" },
    { hex: "#74c7ec", name: "Catppuccin Sapphire" },
    { hex: "#a6e3a1", name: "Catppuccin Mint" },
    { hex: "#f9e2af", name: "Catppuccin Gold" },
    { hex: "#fab387", name: "Catppuccin Peach" },
    { hex: "#f5c2e7", name: "Catppuccin Pink" },
    { hex: "#f2cdcd", name: "Catppuccin Flamingo" },
    { hex: "#e6d5b8", name: "Vintage Parchment" },
    { hex: "#ffffff", name: "Crisp White" },
    { hex: "#bac2de", name: "Catppuccin Subtext" },
  ];

  return (
    <div className="space-y-6">
      {/* Font Family */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8] mb-2.5 flex items-center space-x-1.5">
          <Type className="h-3.5 w-3.5 text-[#89b4fa]" />
          <span>Typeface</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {fontOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => onChangeSettings({ font: f.id })}
              className={`flex flex-col items-start rounded-lg border px-3.5 py-2 text-left transition-colors ${
                settings.font === f.id
                  ? "border-[#89b4fa] bg-[#89b4fa]/15 text-white"
                  : "border-[#313244] bg-[#11111b]/60 text-[#cdd6f4] hover:border-[#45475a] hover:text-white"
              }`}
            >
              <span className={`text-sm font-medium ${f.className}`}>{f.label}</span>
              <span className="text-[11px] text-[#a6adc8]">{f.preview}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8]">
            Font Size
          </label>
          <span className="font-mono text-xs text-[#89b4fa]">{settings.fontSize}px</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onChangeSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
            disabled={settings.fontSize <= 14}
            className="rounded border border-[#313244] bg-[#11111b] p-2 text-[#cdd6f4] hover:bg-[#313244] disabled:opacity-40"
            aria-label="Decrease font size"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="range"
            min="14"
            max="28"
            step="1"
            value={settings.fontSize}
            onChange={(e) => onChangeSettings({ fontSize: parseInt(e.target.value, 10) })}
            className="flex-1 accent-[#89b4fa] cursor-pointer h-1.5 bg-[#313244] rounded-lg appearance-none"
          />
          <button
            onClick={() => onChangeSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
            disabled={settings.fontSize >= 28}
            className="rounded border border-[#313244] bg-[#11111b] p-2 text-[#cdd6f4] hover:bg-[#313244] disabled:opacity-40"
            aria-label="Increase font size"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Line Height / Spacing */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8]">
            Line Spacing
          </label>
          <span className="font-mono text-xs text-[#89b4fa]">{settings.lineHeight.toFixed(2)}x</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Compact", value: 1.65 },
            { label: "Standard", value: 1.85 },
            { label: "Spacious", value: 2.1 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onChangeSettings({ lineHeight: item.value })}
              className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                Math.abs(settings.lineHeight - item.value) < 0.05
                  ? "border-[#89b4fa] bg-[#89b4fa]/20 text-white font-medium"
                  : "border-[#313244] bg-[#11111b]/60 text-[#a6adc8] hover:text-white hover:border-[#45475a]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Color & Color Wheel */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8] flex items-center space-x-1.5">
            <Palette className="h-3.5 w-3.5 text-[#89b4fa]" />
            <span>Font Color</span>
          </label>
          <button
            onClick={() => onChangeSettings({ fontColor: "#cdd6f4" })}
            title="Reset to Catppuccin default"
            className="inline-flex items-center space-x-1 text-[11px] text-[#a6adc8] hover:text-[#89b4fa] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Default</span>
          </button>
        </div>

        {/* Color Wheel Trigger & Direct Hex Input */}
        <div className="flex items-center gap-2.5 mb-3.5 p-2.5 rounded-lg border border-[#313244] bg-[#11111b]/70">
          {/* Active color swatch with color wheel launcher */}
          <label
            htmlFor="color-wheel-picker"
            className="group relative flex items-center space-x-2 cursor-pointer rounded-md border border-[#45475a] bg-[#181825] px-2.5 py-1.5 hover:border-[#89b4fa] transition-all"
            title="Open Color Wheel Selector"
          >
            {/* Color wheel visual gradient circle */}
            <span
              className="h-5 w-5 rounded-full shadow-inner flex-shrink-0 border border-white/20"
              style={{
                background: "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
              }}
            />
            <span className="text-xs font-medium text-[#cdd6f4] group-hover:text-white">
              Color Wheel
            </span>
            <input
              id="color-wheel-picker"
              type="color"
              value={currentFontColor.startsWith("#") ? currentFontColor : "#cdd6f4"}
              onChange={(e) => onChangeSettings({ fontColor: e.target.value })}
              className="sr-only"
            />
          </label>

          {/* Current Color Indicator Swatch */}
          <div
            className="h-7 w-7 rounded-md border border-[#45475a] shadow-sm flex-shrink-0"
            style={{ backgroundColor: currentFontColor }}
            title={`Active: ${currentFontColor}`}
          />

          {/* Hex Input */}
          <div className="flex-1 flex items-center rounded-md border border-[#313244] bg-[#181825] px-2.5 py-1 focus-within:border-[#89b4fa]">
            <span className="text-xs text-[#6c7086] mr-1 font-mono">#</span>
            <input
              type="text"
              value={hexInput.startsWith("#") ? hexInput.slice(1) : hexInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                handleHexInputChange({
                  target: { value: `#${raw}` },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              placeholder="cdd6f4"
              className="w-full bg-transparent font-mono text-xs uppercase text-white focus:outline-none"
              maxLength={6}
            />
          </div>
        </div>

        {/* Curated Catppuccin & Reader Presets */}
        <div>
          <div className="text-[11px] font-medium text-[#6c7086] mb-2 uppercase tracking-wider">
            Catppuccin Blue & Reading Presets
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {colorPresets.map((preset) => {
              const isSelected = currentFontColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  onClick={() => onChangeSettings({ fontColor: preset.hex })}
                  title={`${preset.name} (${preset.hex})`}
                  className={`group relative flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition-all ${
                    isSelected
                      ? "border-[#89b4fa] bg-[#89b4fa]/20 shadow-sm"
                      : "border-[#313244] bg-[#11111b]/60 hover:border-[#45475a] hover:bg-[#181825]"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-black/30 shadow-sm mb-1.5 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 text-black font-bold" />}
                  </span>
                  <span
                    className="text-[10px] font-medium truncate max-w-full px-0.5"
                    style={{ color: preset.hex }}
                  >
                    {preset.name.replace("Catppuccin ", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time typography & color preview */}
        <div className="mt-3.5 rounded-lg border border-[#313244] bg-[#11111b]/80 p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[#6c7086] mb-1">
            Preview
          </div>
          <p
            className={`transition-colors duration-150 leading-relaxed font-${settings.font}`}
            style={{
              color: currentFontColor,
              fontSize: `${Math.min(18, Math.max(14, settings.fontSize - 2))}px`,
            }}
          >
            “The world is boundless, who can grasp eternity?”
          </p>
        </div>
      </div>

      {/* Reading Column Width */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8] mb-2 block">
          Reading Width
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Narrow", value: 680, desc: "680px" },
            { label: "Default", value: 760, desc: "760px" },
            { label: "Wide", value: 880, desc: "880px" },
            { label: "Extra Wide", value: 1100, desc: "1100px" },
            { label: "Ultra Wide", value: 1440, desc: "1440px" },
            { label: "Full Wide", value: 9999, desc: "100%" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onChangeSettings({ maxWidth: item.value })}
              className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-xs transition-colors ${
                settings.maxWidth === item.value
                  ? "border-[#89b4fa] bg-[#89b4fa]/20 text-white font-medium shadow-sm"
                  : "border-[#313244] bg-[#11111b]/60 text-[#a6adc8] hover:text-white hover:border-[#45475a]"
              }`}
            >
              <span className="font-medium truncate">{item.label}</span>
              <span className="text-[10px] text-[#6c7086] mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
