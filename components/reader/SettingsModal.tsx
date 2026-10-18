"use client";

import React, { useState, useEffect } from "react";
import { ReaderSettings } from "@/types/novel";
import { FontSelector } from "./FontSelector";
import { BackgroundManager } from "./BackgroundManager";
import { X, SlidersHorizontal, Type, Image as ImageIcon } from "lucide-react";

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

  // Close on Escape key
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
    >
      <div
        className="relative flex w-full max-w-lg flex-col rounded-xl border border-[#313244] bg-[#181825] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4 bg-[#11111b]/60">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-5 w-5 text-[#89b4fa]" />
            <h2 id="reader-settings-heading" className="font-serif text-lg font-semibold text-[#cdd6f4]">
              Reader Appearance
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded p-1.5 text-[#a6adc8] hover:bg-[#313244] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#313244] bg-[#1e1e2e]/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab("typography")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors ${
              activeTab === "typography"
                ? "border-[#89b4fa] text-[#89b4fa]"
                : "border-transparent text-[#a6adc8] hover:text-[#cdd6f4]"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            <span>Typography</span>
          </button>

          <button
            onClick={() => setActiveTab("background")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors ${
              activeTab === "background"
                ? "border-[#89b4fa] text-[#89b4fa]"
                : "border-transparent text-[#a6adc8] hover:text-[#cdd6f4]"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Surface & Background</span>
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
        <div className="border-t border-[#313244] px-6 py-3 bg-[#11111b]/80 flex justify-between items-center text-xs text-[#a6adc8]">
          <span>Theme saved to cookies</span>
          <button
            onClick={onClose}
            className="rounded bg-[#89b4fa] px-4 py-1.5 text-xs font-semibold text-[#11111b] hover:bg-[#b4befe] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
