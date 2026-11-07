"use client";

import React, { useState, useRef } from "react";
import { ReaderSettings } from "@/types/novel";
import { Trash2, Upload, AlertCircle } from "lucide-react";

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
      if (settings.surfaceOpacity > 0.92) {
        onChangeSettings({ surfaceOpacity: 0.88 });
      }
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
    <div className="space-y-6">
      <div>
        <span className="label block mb-2">Custom Wallpaper</span>

        {errorMessage && (
          <div className="mb-3 flex items-start gap-2 border border-danger/50 bg-danger/5 p-3 text-xs text-danger">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
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

          <label htmlFor="custom-bg-input" className="btn-quiet cursor-pointer text-xs">
            <Upload className="h-3.5 w-3.5 text-accent" />
            <span>{customBgUrl ? "Replace Image" : "Choose Image"}</span>
          </label>

          {customBgUrl && (
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="btn-quiet text-xs text-danger border-danger/40 hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          Kept locally in your browser session (JPEG, PNG, WebP, AVIF, or GIF up to 10 MB).
        </p>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="surface-opacity-range" className="label">
            Page Backing Opacity
          </label>
          <span className="text-xs font-medium text-accent tnum">
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
          className="w-full cursor-pointer h-1.5 bg-line-strong rounded appearance-none"
        />
        <div className="flex justify-between text-[11px] text-faint mt-1 tnum">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
