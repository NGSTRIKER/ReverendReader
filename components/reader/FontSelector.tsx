"use client";

import React from "react";
import { ReaderSettings, ReaderFont } from "@/types/novel";
import { Type, Minus, Plus } from "lucide-react";

interface FontSelectorProps {
  settings: ReaderSettings;
  onChangeSettings: (settings: Partial<ReaderSettings>) => void;
}

export function FontSelector({ settings, onChangeSettings }: FontSelectorProps) {
  const fontOptions: { id: ReaderFont; label: string; preview: string; className: string }[] = [
    { id: "serif", label: "Serif", preview: "Georgia Classic", className: "font-serif" },
    { id: "literary", label: "Literary", preview: "Palatino Book", className: "font-literary" },
    { id: "sans", label: "Sans", preview: "Inter System", className: "font-sans" },
    { id: "mono", label: "Mono", preview: "Clean Monospace", className: "font-mono" },
  ];

  return (
    <div className="space-y-5">
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

      {/* Reading Column Width */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8] mb-2 block">
          Reading Width
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Narrow", value: 680 },
            { label: "Default", value: 760 },
            { label: "Wide", value: 880 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onChangeSettings({ maxWidth: item.value })}
              className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                settings.maxWidth === item.value
                  ? "border-[#89b4fa] bg-[#89b4fa]/20 text-white font-medium"
                  : "border-[#313244] bg-[#11111b]/60 text-[#a6adc8] hover:text-white hover:border-[#45475a]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
