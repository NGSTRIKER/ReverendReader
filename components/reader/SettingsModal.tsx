"use client";

import React, { useState, useEffect } from "react";
import { ReaderSettings } from "@/types/novel";
import { FontSelector } from "./FontSelector";
import { BackgroundManager } from "./BackgroundManager";
import { X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onChangeSettings: (settings: Partial<ReaderSettings>) => void;
  customBgUrl: string | null;
  onSetCustomBg: (url: string | null) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  customBgUrl,
  onSetCustomBg,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"typography" | "background">("typography");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-settings-heading"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-[2px] p-4 sm:p-6"
    >
      <div
        className="relative flex w-full max-w-lg flex-col border border-line bg-surface text-ink shadow-sheet overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper">
          <div>
            <p className="label text-accent">Reader Preferences</p>
            <h2 id="reader-settings-heading" className="text-lg font-semibold text-ink">
              Typesetting &amp; Theme
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="icon-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line bg-sunken px-6">
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "typography"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Theme &amp; Typography
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("background")}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "background"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Wallpaper
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === "typography" ? (
            <FontSelector settings={settings} onChangeSettings={onChangeSettings} />
          ) : (
            <BackgroundManager
              customBgUrl={customBgUrl}
              onSetCustomBg={onSetCustomBg}
              settings={settings}
              onChangeSettings={onChangeSettings}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-line px-6 py-3 bg-paper flex justify-between items-center text-xs text-muted">
          <span>Saved automatically</span>
          <button type="button" onClick={onClose} className="btn-primary px-4 py-1.5 text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
