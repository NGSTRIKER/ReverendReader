"use client";

import React, { useState, useRef } from "react";
import { ReaderSettings, ReaderSurfaceTheme } from "@/types/novel";
import { Image as ImageIcon, Trash2, Upload, AlertCircle, Check, Sliders } from "lucide-react";

interface BackgroundManagerProps {
  customBgUrl: string | null;
  onSetCustomBg: (url: string | null) => void;
  settings: ReaderSettings;
  onChangeSettings: (settings: Partial<ReaderSettings>) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const SURFACE_THEMES: {
  id: ReaderSurfaceTheme;
  label: string;
  desc: string;
  bgClass: string;
  tag: string;
}[] = [
  {
    id: "matte-terminal",
    label: "Default Page",
    desc: "Follows Light / Dark mode",
    bgClass: "bg-paper border border-line-strong",
    tag: "Default",
  },
  {
    id: "catppuccin-latte",
    label: "Daylight Paper",
    desc: "Cool Morning Sheet",
    bgClass: "bg-[#eff1f5] border border-[#bcc0cc]",
    tag: "Light",
  },
  {
    id: "sepia",
    label: "Aged Parchment",
    desc: "Warm Dusk Manuscript",
    bgClass: "bg-[#181512] border border-amber-950/60",
    tag: "Scroll",
  },
  {
    id: "catppuccin-jade",
    label: "Bamboo Jade",
    desc: "Muted Forest Ink",
    bgClass: "bg-[#14231b] border border-[#a6e3a1]/40",
    tag: "Jade",
  },
  {
    id: "catppuccin-coffee",
    label: "Roasted Tea",
    desc: "Warm Amber Night",
    bgClass: "bg-[#241a16] border border-[#fab387]/40",
    tag: "Warm",
  },
  {
    id: "catppuccin",
    label: "Night Dusk",
    desc: "Soft Indigo Evening",
    bgClass: "bg-[#1e1e2e] border border-[#89b4fa]/40",
    tag: "Dusk",
  },
  {
    id: "catppuccin-mocha",
    label: "Deep Nightfall",
    desc: "Midnight Lavender Tint",
    bgClass: "bg-[#11111b] border border-[#cba6f7]/40",
    tag: "Night",
  },
  {
    id: "catppuccin-pink",
    label: "Lotus Dusk",
    desc: "Muted Plum Evening",
    bgClass: "bg-[#281827] border border-[#f5c2e7]/40",
    tag: "Lotus",
  },
  {
    id: "terminal-grey",
    label: "Graphite",
    desc: "Muted Slate Grey",
    bgClass: "bg-[#1c1f26] border border-[#343a46]",
    tag: "Slate",
  },
  {
    id: "slate",
    label: "Inkwell Slate",
    desc: "Deep Midnight Blue",
    bgClass: "bg-[#0f172a] border border-slate-700",
    tag: "Navy",
  },
  {
    id: "black",
    label: "True Obsidian",
    desc: "Deep OLED Night",
    bgClass: "bg-[#09090b] border border-zinc-800",
    tag: "OLED",
  },
  {
    id: "acrylic",
    label: "Frosted Paper",
    desc: "Translucent Glass Blur",
    bgClass: "bg-surface/50 backdrop-blur-md border border-line",
    tag: "Frosted",
  },
  {
    id: "blur",
    label: "Smoked Veil",
    desc: "Dusk Translucent Tint",
    bgClass: "bg-[#0e0f12]/60 backdrop-blur-md border border-line",
    tag: "Tint",
  },
  {
    id: "transparent",
    label: "Clear Glass",
    desc: "Show Backdrop Through",
    bgClass: "bg-transparent border border-dashed border-line-strong",
    tag: "Clear",
  },
];

export function BackgroundManager({
  customBgUrl,
  onSetCustomBg,
  settings,
  onChangeSettings,
}: BackgroundManagerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage(
        "Unsupported file type. Please upload a JPEG, PNG, WebP, AVIF, or GIF image."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const newUrl = URL.createObjectURL(file);
      onSetCustomBg(newUrl);
    } catch {
      setErrorMessage("Could not load image locally. Please try a different image.");
    }
  };

  const handleRemoveBackground = () => {
    onSetCustomBg(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 font-sans text-sm">
      {/* Background Image Upload */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-accent" />
          <span>Custom Wallpaper</span>
        </label>

        {errorMessage && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger">
            <AlertCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="custom-bg-input"
          />

          <label
            htmlFor="custom-bg-input"
            className="btn-quiet min-h-[44px] cursor-pointer rounded-xl py-2 px-3.5 text-xs font-semibold flex items-center gap-2 hover:bg-surface"
          >
            <Upload className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{customBgUrl ? "Change Wallpaper" : "Upload Custom Wallpaper"}</span>
          </label>

          {customBgUrl && (
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="btn min-h-[44px] rounded-xl py-2 px-3 text-xs border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Restore Default</span>
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Session only (cleared on page reload). Stays private in your browser (max 10 MB).
        </p>
      </div>

      {/* Surface Tone & Template Palette */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p
            id="surface-theme-label"
            className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5"
          >
            <Sliders className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Reading Surface Theme</span>
          </p>
          <span className="text-xs text-muted">14 Presets</span>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="surface-theme-label"
          className="grid grid-cols-2 gap-2"
        >
          {SURFACE_THEMES.map((theme) => {
            const active = (settings.surfaceTheme || "matte-terminal") === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  const updates: Partial<ReaderSettings> = { surfaceTheme: theme.id };
                  if (theme.id === "transparent") {
                    updates.surfaceOpacity = 0;
                  } else if (theme.id === "acrylic" && settings.surfaceOpacity > 0.65) {
                    updates.surfaceOpacity = 0.55;
                  } else if (theme.id === "blur" && settings.surfaceOpacity > 0.7) {
                    updates.surfaceOpacity = 0.5;
                  } else if (settings.surfaceOpacity === 0) {
                    updates.surfaceOpacity = 0.95;
                  }

                  // Preserve Auto Ink (#e4e8f0 sentinel) across surface switches; reset mismatched dark ink when moving away from Daylight Paper
                  if (theme.id === "catppuccin-latte" && settings.fontColor === "#4c4f69") {
                    updates.fontColor = "#e4e8f0";
                  } else if (theme.id !== "catppuccin-latte" && settings.fontColor === "#4c4f69") {
                    updates.fontColor = "#e4e8f0";
                  }

                  onChangeSettings(updates);
                }}
                className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                  active
                    ? "border-accent bg-accent/15 text-ink shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken hover:border-line-strong hover:bg-surface"
                }`}
              >
                <span className={`h-4 w-4 rounded-full flex-shrink-0 ${theme.bgClass}`} aria-hidden="true" />
                <div className="truncate flex-1 min-w-0">
                  <div className="font-semibold text-ink truncate">{theme.label}</div>
                  <div className="text-[11px] text-muted truncate">{theme.desc}</div>
                </div>
                {active && <Check className="h-3.5 w-3.5 text-accent flex-shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Surface Opacity Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="surface-opacity-range"
            className="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Background Overlay Opacity
          </label>
          <span className="font-mono text-xs font-medium text-accent tnum bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
            {Math.round(settings.surfaceOpacity * 100)}%
          </span>
        </div>
        <input
          id="surface-opacity-range"
          type="range"
          min="0"
          max="1.0"
          step="0.05"
          value={settings.surfaceOpacity}
          onChange={(e) => onChangeSettings({ surfaceOpacity: parseFloat(e.target.value) })}
          aria-label="Reading surface opacity"
          className="w-full cursor-pointer h-2 bg-line-strong rounded-lg appearance-none accent-accent"
        />
        <div className="flex justify-between text-[11px] text-muted mt-1">
          <span>0% (See-Through)</span>
          <span>50% (Semi)</span>
          <span>100% (Solid)</span>
        </div>
      </div>
    </div>
  );
}
