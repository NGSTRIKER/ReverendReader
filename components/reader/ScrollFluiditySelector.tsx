"use client";

import React, { useRef, useState, useEffect } from "react";
import { ReaderSettings } from "@/types/novel";
import { Wind, RotateCcw, Check, Mouse, Sparkles, Activity } from "lucide-react";

interface ScrollFluiditySelectorProps {
  settings: ReaderSettings;
  onChangeSettings: (settings: Partial<ReaderSettings>) => void;
}

const PRESETS = [
  { label: "Off", value: 0, tag: "Native", desc: "Standard stepped browser scroll" },
  { label: "Gentle", value: 25, tag: "Light", desc: "Short, subtle smooth deceleration" },
  { label: "Smooth", value: 50, tag: "Balanced", desc: "Natural glide with moderate inertia" },
  { label: "Fluid", value: 75, tag: "Dynamic", desc: "Long, expressive momentum glide" },
  { label: "Ultra", value: 100, tag: "Cinematic", desc: "Maximum frictionless glide" },
];

export function ScrollFluiditySelector({
  settings,
  onChangeSettings,
}: ScrollFluiditySelectorProps) {
  const currentFluidity = settings.scrollFluidity ?? 0;
  const [testScrollY, setTestScrollY] = useState(0);
  const [activeVelocity, setActiveVelocity] = useState(0);

  // Live test sandbox momentum simulation
  const sandboxRef = useRef<HTMLDivElement>(null);
  const sandboxVelocityRef = useRef(0);
  const sandboxRafRef = useRef<number | null>(null);

  const handlePresetSelect = (val: number) => {
    onChangeSettings({ scrollFluidity: val });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeSettings({ scrollFluidity: Number(e.target.value) });
  };

  // Interactive sandbox wheel simulation
  const handleSandboxWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (currentFluidity <= 0) return; // Native scroll in sandbox
    e.preventDefault();

    const f = currentFluidity / 100;
    const impulse = e.deltaY * (0.4 + f * 0.6);
    sandboxVelocityRef.current = sandboxVelocityRef.current * 0.5 + impulse;
    setActiveVelocity(Math.round(Math.abs(sandboxVelocityRef.current)));

    if (!sandboxRafRef.current) {
      const step = () => {
        if (!sandboxRef.current) {
          sandboxRafRef.current = null;
          return;
        }

        if (Math.abs(sandboxVelocityRef.current) < 0.2) {
          sandboxVelocityRef.current = 0;
          sandboxRafRef.current = null;
          setActiveVelocity(0);
          return;
        }

        const max = sandboxRef.current.scrollHeight - sandboxRef.current.clientHeight;
        const next = Math.min(
          max,
          Math.max(0, sandboxRef.current.scrollTop + sandboxVelocityRef.current)
        );

        sandboxRef.current.scrollTop = next;
        setTestScrollY(Math.round(next));

        const baseFriction = 0.82 + f * 0.145;
        sandboxVelocityRef.current *= baseFriction;
        setActiveVelocity(Math.round(Math.abs(sandboxVelocityRef.current)));

        sandboxRafRef.current = requestAnimationFrame(step);
      };
      sandboxRafRef.current = requestAnimationFrame(step);
    }
  };

  useEffect(() => {
    return () => {
      if (sandboxRafRef.current) {
        cancelAnimationFrame(sandboxRafRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-5 text-ink font-mono text-xs">
      {/* Overview Banner */}
      <div className="rounded-xl border border-line bg-sunken/80 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-xs text-accent">
            <Mouse className="h-4 w-4" />
            <span>Desktop Scroll Momentum / 鼠标平滑惯性</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold">
            {currentFluidity === 0 ? "Off (Native)" : `${currentFluidity}% Fluidity`}
          </span>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          Gives mouse wheel scrolling smooth inertial gliding. When you spin the wheel and release,
          the page glides forward based on your scrolling speed and smoothly comes to rest.
        </p>
      </div>

      {/* Preset Buttons */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-accent" />
            <span>Fluidity Presets / 惯性档位</span>
          </span>
          <span className="text-[10px] text-faint">Instant Setup</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {PRESETS.map((preset) => {
            const isSelected = currentFluidity === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetSelect(preset.value)}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-xs transition-all text-center ${
                  isSelected
                    ? "border-accent bg-accent/15 text-ink font-semibold shadow-sm ring-1 ring-accent/30"
                    : "border-line bg-sunken text-muted hover:text-ink hover:border-line-strong"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-ink">{preset.label}</span>
                  {isSelected && <Check className="h-3 w-3 text-accent" />}
                </div>
                <span className="text-[9px] uppercase tracking-wider text-accent/80 font-bold mt-0.5">
                  {preset.tag}
                </span>
                <span className="text-[9px] text-muted/80 mt-1 line-clamp-1">
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fluidity Fine-Tuning Slider */}
      <div className="rounded-xl border border-line bg-paper p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Fine-Tune Momentum / 细调阻尼</span>
          </span>
          <span className="tabular-nums font-bold text-accent px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20">
            {currentFluidity}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={currentFluidity}
          onChange={handleSliderChange}
          aria-label="Adjust scroll fluidity"
          className="w-full accent-accent cursor-pointer h-2 bg-sunken rounded-lg"
        />

        <div className="flex justify-between text-[10px] text-muted tabular-nums">
          <span>0% (Disabled)</span>
          <span>25% (Gentle)</span>
          <span>50% (Smooth)</span>
          <span>75% (Fluid)</span>
          <span>100% (Cinematic)</span>
        </div>
      </div>

      {/* Interactive Live Sandbox Preview */}
      <div className="rounded-xl border border-line bg-sunken/90 p-3 sm:p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted mb-2">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-accent" />
            <span>&gt;_ Live Test Sandbox (Scroll Inside Here)</span>
          </span>
          <span className="text-[9px] text-accent tabular-nums">
            {activeVelocity > 0 ? `Speed: ${activeVelocity} px/s` : `Pos: ${testScrollY}px`}
          </span>
        </div>

        <div
          ref={sandboxRef}
          onWheel={handleSandboxWheel}
          className="h-28 overflow-y-auto rounded-lg border border-line bg-paper/90 p-3 font-serif text-[13px] leading-relaxed select-none relative shadow-inner scroll-smooth"
        >
          <div className="space-y-2 text-ink/90">
            <p className="font-mono text-[10px] text-accent uppercase tracking-wider">
              {currentFluidity > 0
                ? "▶ [Momentum Active: Spin your mouse wheel fast to test glide]"
                : "▷ [Native Scroll: Smooth momentum is currently turned off]"}
            </p>
            <p>
              “In this world, humans are the essence of heaven and earth, and Gu are the refined spirits of myriad things.”
            </p>
            <p>
              “Fang Yuan stood atop the snowy cliff, looking down at Qing Mao Mountain with ancient eyes. Five hundred years of blood and rebirth...”
            </p>
            <p>
              “True freedom is having the resolve to walk your chosen path without looking back, regardless of worldly judgments or praise.”
            </p>
            <p>
              “The Spring Autumn Cicada vibrated softly inside his aperture, rippling through the river of time.”
            </p>
            <p className="font-mono text-[10px] text-muted text-center pt-2">
              — End of test sandbox —
            </p>
          </div>
        </div>
      </div>

      {/* Reset Section */}
      <div className="pt-2 border-t border-line flex justify-between items-center">
        <span className="text-[11px] text-muted">Restore native mouse scrolling</span>
        <button
          type="button"
          onClick={() => onChangeSettings({ scrollFluidity: 0 })}
          className="btn-quiet text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset to Native</span>
        </button>
      </div>
    </div>
  );
}
