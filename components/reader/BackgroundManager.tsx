"use client";

import React, { useState, useRef } from "react";
import { ReaderSettings, ReaderSurfaceTheme } from "@/types/novel";
import { Image as ImageIcon, Trash2, Upload, AlertCircle, Check } from "lucide-react";

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

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage(
        "Unsupported file type. Please upload a JPEG, PNG, WebP, AVIF, or GIF image."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      // Create Object URL locally (never sent to any server)
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

  const surfaceThemes: { id: ReaderSurfaceTheme; label: string; desc: string; bgClass: string }[] = [
    { id: "catppuccin", label: "Catppuccin Blue", desc: "Soothing Blue Mocha", bgClass: "bg-[#1e1e2e] border border-[#89b4fa]" },
    { id: "catppuccin-mocha", label: "Catppuccin Mocha", desc: "Deep Midnight & Mauve", bgClass: "bg-[#11111b] border border-[#cba6f7]" },
    { id: "catppuccin-pink", label: "Catppuccin Pink", desc: "Flamingo & Velvet Rose", bgClass: "bg-[#281827] border border-[#f5c2e7]" },
    { id: "catppuccin-coffee", label: "Catppuccin Coffee", desc: "Warm Caramel & Espresso", bgClass: "bg-[#241a16] border border-[#fab387]" },
    { id: "catppuccin-jade", label: "Catppuccin Jade", desc: "Bamboo & Herbal Forest", bgClass: "bg-[#14231b] border border-[#a6e3a1]" },
    { id: "catppuccin-latte", label: "Catppuccin Latte", desc: "Gentle Day Reading (Light)", bgClass: "bg-[#eff1f5] border border-[#1e66f5]" },
    { id: "acrylic", label: "Acrylic Glass", desc: "Frosted Glass Blur", bgClass: "bg-white/10 backdrop-blur-md border border-white/20" },
    { id: "blur", label: "Soft Dark Blur", desc: "Gentle Transparent Tint", bgClass: "bg-[#11111b]/50 backdrop-blur-md border border-white/10" },
    { id: "transparent", label: "Full Transparent", desc: "100% See-Through", bgClass: "bg-transparent border border-dashed border-[#89b4fa]/60" },
    { id: "dark", label: "Charcoal Dark", desc: "Classic Dark", bgClass: "bg-[#181825] border border-[#313244]" },
    { id: "black", label: "Pure Onyx", desc: "Absolute OLED Black", bgClass: "bg-[#09090b] border border-zinc-800" },
    { id: "slate", label: "Deep Slate", desc: "Cool Oceanic Navy", bgClass: "bg-[#0f172a] border border-slate-700" },
    { id: "sepia", label: "Aged Sepia", desc: "Warm Parchment Noir", bgClass: "bg-[#171412] border border-amber-950/60" },
  ];

  return (
    <div className="space-y-5">
      {/* Background Image Upload Section */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8] mb-2.5 flex items-center space-x-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-[#89b4fa]" />
          <span>Custom Background</span>
        </label>

        {errorMessage && (
          <div className="mb-3 flex items-start space-x-2 rounded-lg border border-[#f38ba8]/60 bg-[#f38ba8]/10 p-2.5 text-xs text-[#f38ba8]">
            <AlertCircle className="h-4 w-4 text-[#f38ba8] flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
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
            className="inline-flex cursor-pointer items-center space-x-2 rounded border border-[#45475a] bg-[#181825] px-3.5 py-2 text-xs font-medium text-[#cdd6f4] hover:bg-[#313244] hover:text-white transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-[#89b4fa]" />
            <span>{customBgUrl ? "Change Image" : "Upload Image"}</span>
          </label>

          {customBgUrl && (
            <button
              onClick={handleRemoveBackground}
              className="inline-flex items-center space-x-1.5 rounded border border-[#f38ba8]/60 bg-[#f38ba8]/10 px-3 py-2 text-xs font-medium text-[#f38ba8] hover:bg-[#f38ba8]/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Restore Default</span>
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-[#6c7086]">
          Processed locally in your browser. Max 10MB (JPEG, PNG, WebP, GIF).
        </p>
      </div>

      {/* Surface Tone & Effects */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8] mb-2 block">
          Reading Surface Tone
        </label>
        <div className="grid grid-cols-2 gap-2">
          {surfaceThemes.map((theme) => (
            <button
              key={theme.id}
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

                // Auto-switch font color appropriately if transitioning between light / dark
                if (theme.id === "catppuccin-latte" && (!settings.fontColor || settings.fontColor === "#cdd6f4")) {
                  updates.fontColor = "#4c4f69";
                } else if (theme.id !== "catppuccin-latte" && settings.fontColor === "#4c4f69") {
                  updates.fontColor = "#cdd6f4";
                }

                onChangeSettings(updates);
              }}
              className={`flex items-center space-x-2.5 rounded-lg border p-2.5 text-left text-xs transition-colors ${
                settings.surfaceTheme === theme.id
                  ? "border-[#89b4fa] bg-[#89b4fa]/15 text-white"
                  : "border-[#313244] text-[#a6adc8] hover:border-[#45475a] hover:text-[#cdd6f4]"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full flex-shrink-0 ${theme.bgClass}`}
              />
              <div className="truncate flex-1">
                <div className="font-medium text-[#cdd6f4]">{theme.label}</div>
                <div className="text-[10px] text-[#a6adc8] truncate">{theme.desc}</div>
              </div>
              {settings.surfaceTheme === theme.id && (
                <Check className="h-3.5 w-3.5 text-[#89b4fa] ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Surface Opacity Overlay */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#a6adc8]">
            Surface Opacity
          </label>
          <span className="font-mono text-xs text-[#89b4fa]">
            {Math.round(settings.surfaceOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1.0"
          step="0.05"
          value={settings.surfaceOpacity}
          onChange={(e) =>
            onChangeSettings({ surfaceOpacity: parseFloat(e.target.value) })
          }
          className="w-full accent-[#89b4fa] cursor-pointer h-1.5 bg-[#313244] rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-[#6c7086] mt-1">
          <span>0% (Full Transparent)</span>
          <span>50% (Semi)</span>
          <span>100% (Solid)</span>
        </div>
      </div>
    </div>
  );
}
