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
    label: "Matte Terminal",
    desc: "Black & Graphite Grey",
    bgClass: "bg-[#16181d] border border-[#2a2e38]",
    tag: "Terminal",
  },
  {
    id: "terminal-grey",
    label: "Terminal Charcoal",
    desc: "Slate Grey Panel",
    bgClass: "bg-[#1c1f26] border border-[#343a46]",
    tag: "Charcoal",
  },
  {
    id: "black",
    label: "Pure Onyx",
    desc: "Absolute OLED Zero",
    bgClass: "bg-[#09090b] border border-zinc-800",
    tag: "OLED",
  },
  {
    id: "slate",
    label: "Deep Slate Navy",
    desc: "Oceanic Twilight",
    bgClass: "bg-[#0f172a] border border-slate-700",
    tag: "Navy",
  },
  {
    id: "catppuccin",
    label: "Catppuccin Blue",
    desc: "Soothing Blue Mocha",
    bgClass: "bg-[#1e1e2e] border border-[#89b4fa]/40",
    tag: "Sapphire",
  },
  {
    id: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    desc: "Deep Midnight Mauve",
    bgClass: "bg-[#11111b] border border-[#cba6f7]/40",
    tag: "Midnight",
  },
  {
    id: "catppuccin-jade",
    label: "Bamboo Jade",
    desc: "Cultivation Herbal Green",
    bgClass: "bg-[#14231b] border border-[#a6e3a1]/40",
    tag: "Emerald",
  },
  {
    id: "catppuccin-pink",
    label: "Velvet Rose",
    desc: "Rose Petal Noir",
    bgClass: "bg-[#281827] border border-[#f5c2e7]/40",
    tag: "Rose",
  },
  {
    id: "catppuccin-coffee",
    label: "Warm Espresso",
    desc: "Caramel & Amber",
    bgClass: "bg-[#241a16] border border-[#fab387]/40",
    tag: "Warm",
  },
  {
    id: "sepia",
    label: "Aged Sepia",
    desc: "Warm Parchment Noir",
    bgClass: "bg-[#181512] border border-amber-950/60",
    tag: "Scroll",
  },
  {
    id: "catppuccin-latte",
    label: "Gentle Day White",
    desc: "Light Paper Canvas",
    bgClass: "bg-[#eff1f5] border border-[#bcc0cc]",
    tag: "Light",
  },
  {
    id: "acrylic",
    label: "Acrylic Glass",
    desc: "Frosted Glass Blur",
    bgClass: "bg-surface/50 backdrop-blur-md border border-line",
    tag: "Frosted",
  },
  {
    id: "blur",
    label: "Soft Dark Blur",
    desc: "Translucent Tint",
    bgClass: "bg-[#0e0f12]/60 backdrop-blur-md border border-line",
    tag: "Tint",
  },
  {
    id: "transparent",
    label: "Full Transparent",
    desc: "100% See-Through",
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
    <div className="space-y-6 font-mono text-sm">
      {/* Background Image Upload */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-accent" />
            <span>Custom Wallpaper / 自定义壁纸</span>
          </span>
          <span className="chinese-seal text-[10px]">画</span>
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
            className="btn-quiet cursor-pointer rounded-xl py-2 px-3.5 text-xs font-semibold flex items-center gap-2 hover:bg-surface"
          >
            <Upload className="h-3.5 w-3.5 text-accent" />
            <span>{customBgUrl ? "Change Wallpaper" : "Upload Custom Wallpaper"}</span>
          </label>

          {customBgUrl && (
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="btn rounded-xl py-2 px-3 text-xs border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Restore Default</span>
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-faint">
          Processed locally in your browser. Never uploaded to servers. Max 10MB (JPEG, PNG, WebP, GIF).
        </p>
      </div>

      {/* Surface Tone & Template Palette */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-accent" />
            <span>Reading Surface Template / 背景主题</span>
          </label>
          <span className="text-[10px] text-faint">14 Curated Palettes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
          {SURFACE_THEMES.map((theme) => {
            const active = (settings.surfaceTheme || "matte-terminal") === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
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

                  // Auto-adjust font color between light/dark presets if desired
                  if (theme.id === "catppuccin-latte" && (!settings.fontColor || settings.fontColor === "#e4e8f0")) {
                    updates.fontColor = "#4c4f69";
                  } else if (theme.id !== "catppuccin-latte" && settings.fontColor === "#4c4f69") {
                    updates.fontColor = "#e4e8f0";
                  }

                  onChangeSettings(updates);
                }}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                  active
                    ? "border-accent bg-accent/15 text-ink shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken hover:border-line-strong hover:bg-surface"
                }`}
              >
                <span className={`h-4 w-4 rounded-full flex-shrink-0 ${theme.bgClass}`} />
                <div className="truncate flex-1 min-w-0">
                  <div className="font-semibold text-ink truncate">{theme.label}</div>
                  <div className="text-[10px] text-muted truncate">{theme.desc}</div>
                </div>
                {active && <Check className="h-3.5 w-3.5 text-accent flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Surface Opacity Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Surface Opacity Overlay / 遮罩透明度
          </label>
          <span className="text-xs font-medium text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
            {Math.round(settings.surfaceOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1.0"
          step="0.05"
          value={settings.surfaceOpacity}
          onChange={(e) => onChangeSettings({ surfaceOpacity: parseFloat(e.target.value) })}
          className="w-full cursor-pointer h-1.5 bg-line-strong rounded-lg appearance-none accent-accent"
        />
        <div className="flex justify-between text-[10px] text-faint mt-1">
          <span>0% (See-Through)</span>
          <span>50% (Semi)</span>
          <span>100% (Solid Matte)</span>
        </div>
      </div>
    </div>
  );
}
