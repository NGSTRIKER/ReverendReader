"use client";

import React, { useEffect, useRef, useState } from "react";
import { ReaderSettings } from "@/types/novel";
import { FontSelector } from "./FontSelector";
import { BackgroundManager } from "./BackgroundManager";
import { ScrollFluiditySelector } from "./ScrollFluiditySelector";
import { useDialogAccessibility } from "@/components/ui/useDialogAccessibility";
import { X, Type, Image as ImageIcon, Wind } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"typography" | "background" | "scroll">("typography");
  const modalRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility(isOpen, onClose, modalRef);

  // Scroll wheel momentum is desktop-only; keep mobile focused on typography & themes
  useEffect(() => {
    if (!isOpen || activeTab !== "scroll") return;
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) {
      setActiveTab("typography");
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-0 sm:p-6"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-settings-heading"
        tabIndex={-1}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        className="relative flex w-full max-w-xl h-[88dvh] sm:h-auto sm:max-h-[85vh] flex-col rounded-t-2xl sm:rounded-2xl border border-line bg-surface text-ink shadow-2xl overflow-hidden font-sans focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 sm:px-5 py-3.5 bg-paper">
          <h2
            id="reader-settings-heading"
            className="font-serif text-lg sm:text-xl font-bold text-ink truncate"
          >
            Reading Settings
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="circle-icon-btn flex-shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          aria-label="Reading settings categories"
          className="flex border-b border-line bg-sunken px-4 sm:px-5 gap-1.5 sm:gap-2 pt-2 overflow-x-auto"
        >
          <button
            id="settings-tab-typography"
            type="button"
            role="tab"
            aria-selected={activeTab === "typography"}
            aria-controls="settings-panel-typography"
            onClick={() => setActiveTab("typography")}
            className={`flex min-h-[44px] sm:min-h-[38px] items-center gap-1.5 rounded-t-xl px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border-t border-x whitespace-nowrap flex-shrink-0 ${
              activeTab === "typography"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Type className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Typography</span>
          </button>

          <button
            id="settings-tab-background"
            type="button"
            role="tab"
            aria-selected={activeTab === "background"}
            aria-controls="settings-panel-background"
            onClick={() => setActiveTab("background")}
            className={`flex min-h-[44px] sm:min-h-[38px] items-center gap-1.5 rounded-t-xl px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border-t border-x whitespace-nowrap flex-shrink-0 ${
              activeTab === "background"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Paper &amp; Themes</span>
          </button>

          <button
            id="settings-tab-scroll"
            type="button"
            role="tab"
            aria-selected={activeTab === "scroll"}
            aria-controls="settings-panel-scroll"
            onClick={() => setActiveTab("scroll")}
            className={`hidden sm:flex min-h-[38px] items-center gap-1.5 rounded-t-xl px-4 py-2 text-xs font-semibold transition-all border-t border-x whitespace-nowrap flex-shrink-0 ${
              activeTab === "scroll"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Wind className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Scroll</span>
          </button>
        </div>

        {/* Content */}
        <div
          id={`settings-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${activeTab}`}
          className="p-4 sm:p-5 flex-1 overflow-y-auto"
        >
          {activeTab === "typography" ? (
            <FontSelector settings={settings} onChangeSettings={onChangeSettings} />
          ) : activeTab === "background" ? (
            <BackgroundManager
              customBgUrl={customBgUrl}
              onSetCustomBg={onSetCustomBg}
              settings={settings}
              onChangeSettings={onChangeSettings}
            />
          ) : (
            <ScrollFluiditySelector settings={settings} onChangeSettings={onChangeSettings} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-line px-4 sm:px-5 py-3 bg-paper flex justify-between items-center text-xs text-muted">
          <span className="text-xs text-muted">Saved automatically</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary min-h-[44px] sm:min-h-[38px] rounded-xl px-5 py-2 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
