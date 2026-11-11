"use client";

import { useEffect, useRef } from "react";

/**
 * Checks whether the event happened inside an independently scrollable container
 * (such as a modal popup, TOC index list, comments drawer, or dropdown menu).
 */
function isInsideScrollableContainer(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 2
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * High-performance, physics-based inertial scrolling for desktop mouse wheel users.
 *
 * When the user scrolls with their mouse wheel, momentum accumulates based on scroll speed.
 * When the user releases the wheel, the page continues gliding smoothly and decelerates
 * naturally according to the selected fluidity level.
 *
 * @param fluidity - 0 = Disabled (native browser scroll), 1-100 = Fluidity / Momentum level
 */
export function useFluidScroll(fluidity: number = 0) {
  const fluidityRef = useRef(fluidity);
  fluidityRef.current = fluidity;

  const velocityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    // 0 = Off / Native browser scrolling. Do not attach wheel listener.
    if (!fluidity || fluidity <= 0) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      velocityRef.current = 0;
      return;
    }

    const cancelMomentum = () => {
      velocityRef.current = 0;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const step = (time: number) => {
      if (Math.abs(velocityRef.current) < 0.15) {
        velocityRef.current = 0;
        rafIdRef.current = null;
        return;
      }

      // Delta time normalization relative to 60 FPS (16.667ms)
      const lastTime = lastFrameTimeRef.current || time;
      lastFrameTimeRef.current = time;
      const dt = Math.min(3, Math.max(0.2, (time - lastTime) / 16.667));

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const currentY = window.scrollY;
      const nextY = Math.min(
        maxScroll,
        Math.max(0, currentY + velocityRef.current * dt)
      );

      // Hit boundary (top or bottom of page)
      if (
        (nextY <= 0 && velocityRef.current < 0) ||
        (nextY >= maxScroll && velocityRef.current > 0)
      ) {
        window.scrollTo(0, nextY);
        velocityRef.current = 0;
        rafIdRef.current = null;
        return;
      }

      window.scrollTo(0, nextY);

      // Friction damping calculation based on fluidity (0-100)
      // Higher fluidity = lower friction = longer smooth glide
      const f = Math.min(100, Math.max(1, fluidityRef.current)) / 100;
      const baseFriction = 0.82 + f * 0.145; // 0.82 (Gentle) to 0.965 (Ultra fluid)
      const frameFriction = Math.pow(baseFriction, dt);

      velocityRef.current *= frameFriction;

      rafIdRef.current = requestAnimationFrame(step);
    };

    const handleWheel = (e: WheelEvent) => {
      // Do not intercept if browser zoom, horizontal scroll, or inside an inner scrollable box
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (isInsideScrollableContainer(e.target)) return;

      e.preventDefault();

      const now = performance.now();
      const dtWheel = now - lastWheelTimeRef.current;
      lastWheelTimeRef.current = now;

      // Normalize delta into pixels
      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        delta *= 38; // Lines mode
      } else if (e.deltaMode === 2) {
        delta *= window.innerHeight; // Pages mode
      }

      // Immediate direction reversal: cancel opposite velocity so user has instant control
      if (
        velocityRef.current !== 0 &&
        Math.sign(velocityRef.current) !== Math.sign(delta)
      ) {
        velocityRef.current = 0;
      }

      // Fluidity momentum calculation
      const f = Math.min(100, Math.max(1, fluidityRef.current)) / 100;

      // Speed bonus: rapid wheel spins (short time between wheel clicks) accumulate momentum
      const speedMultiplier = dtWheel < 45 ? 1.45 : dtWheel < 90 ? 1.2 : 1.0;
      const impulse = delta * (0.65 + f * 0.75) * speedMultiplier;

      // Accumulate velocity with safety clamp
      const maxVelocity = 140 + f * 110;
      const combined = velocityRef.current * 0.65 + impulse;
      velocityRef.current =
        Math.sign(combined) * Math.min(Math.abs(combined), maxVelocity);

      if (!rafIdRef.current) {
        lastFrameTimeRef.current = performance.now();
        rafIdRef.current = requestAnimationFrame(step);
      }
    };

    // Immediate cancellation on deliberate user gestures
    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (scrollKeys.includes(e.key)) {
        cancelMomentum();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointerdown", cancelMomentum, { passive: true });
    window.addEventListener("touchstart", cancelMomentum, { passive: true });
    window.addEventListener("keydown", handleKeyDown, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointerdown", cancelMomentum);
      window.removeEventListener("touchstart", cancelMomentum);
      window.removeEventListener("keydown", handleKeyDown);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [fluidity]);
}
