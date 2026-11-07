"use client";

import React, { useState, useEffect } from "react";
import { ReaderSettings } from "@/types/novel";
import { FontSelector } from "./FontSelector";
import { BackgroundManager } from "./BackgroundManager";
import { X, Type, Image as ImageIcon } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
    >
      <div
        className="relative flex w-full max-w-xl flex-col rounded-2xl border border-line bg-surface text-ink shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-paper">
          <div className="flex items-center gap-2.5">
            {/* Terminal Window Dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            </div>
            <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <span>&gt;_</span>
              <span id="reader-settings-heading">READER_SETTINGS / 配置中心</span>
            </span>
            <span className="chinese-seal text-[10px]">蛊</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="icon-btn rounded-lg h-7 w-7"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line bg-sunken px-5 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`flex items-center gap-1.5 rounded-t-xl px-4 py-2 text-xs font-semibold transition-all border-t border-x ${
              activeTab === "typography"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            <span>[01: TYPOGRAPHY / 排版]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("background")}
            className={`flex items-center gap-1.5 rounded-t-xl px-4 py-2 text-xs font-semibold transition-all border-t border-x ${
              activeTab === "background"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>[02: THEMES &amp; BG / 壁纸]</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
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
        <div className="border-t border-line px-5 py-3 bg-paper flex justify-between items-center text-xs text-muted">
          <span className="text-[11px] text-faint">Persistent across devices · 自动保存</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary rounded-xl px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
