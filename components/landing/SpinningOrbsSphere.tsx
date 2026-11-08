"use client";

import React, { useEffect, useRef } from "react";

interface SpinningOrbsSphereProps {
  isHovered?: boolean;
  tiltX?: number; // -1 to 1
  tiltY?: number; // -1 to 1
  className?: string;
}

interface OrbPoint {
  theta: number;
  phi: number;
  baseRadius: number;
  speedOffset: number;
  ringIndex: number;
}

export function SpinningOrbsSphere({
  isHovered = false,
  tiltX = 0,
  tiltY = 0,
  className = "",
}: SpinningOrbsSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverRef = useRef(isHovered);
  const tiltRef = useRef({ x: tiltX, y: tiltY });

  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    tiltRef.current = { x: tiltX, y: tiltY };
  }, [tiltX, tiltY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotY = 0.4;
    let rotX = -0.32;
    let rotZ = 0.18;
    let currentSpeed = 0.006;
    let currentScale = 1.0;
    let smoothTiltX = 0;
    let smoothTiltY = 0;

    // Generate Fibonacci sphere orbs + ring satellite orbs
    const orbs: OrbPoint[] = [];
    const numFibonacciOrbs = 44;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numFibonacciOrbs; i++) {
      const y = 1 - (i / (numFibonacciOrbs - 1)) * 2;
      const phi = Math.acos(Math.max(-1, Math.min(1, y)));
      const theta = goldenAngle * i;
      orbs.push({
        theta,
        phi,
        baseRadius: i % 5 === 0 ? 3.4 : 2.1,
        speedOffset: (i % 3 === 0 ? 1.4 : 0.8) * (i % 2 === 0 ? 1 : -1),
        ringIndex: -1,
      });
    }

    // Add dedicated orbiting satellite orbs on 4 great-circle rings
    const ringTilts = [
      { rx: 0.45, rz: -0.35 },
      { rx: -0.6, rz: 0.4 },
      { rx: 1.15, rz: 0.2 },
      { rx: 0.15, rz: 1.1 },
    ];

    ringTilts.forEach((_, rIdx) => {
      const count = 6;
      for (let j = 0; j < count; j++) {
        orbs.push({
          theta: (j / count) * Math.PI * 2,
          phi: Math.PI / 2,
          baseRadius: j % 2 === 0 ? 4.0 : 2.6,
          speedOffset: (rIdx % 2 === 0 ? 1 : -1) * (1.6 + rIdx * 0.25),
          ringIndex: rIdx,
        });
      }
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const rotatePoint = (
      x: number,
      y: number,
      z: number,
      rx: number,
      ry: number,
      rz: number
    ) => {
      // Rotate around X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotate around Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      // Rotate around Z
      const cosZ = Math.cos(rz);
      const sinZ = Math.sin(rz);
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;

      return { x: x3, y: y3, z: z2 };
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const style = getComputedStyle(document.documentElement);
      const inkRaw = style.getPropertyValue("--ink").trim() || "240 240 240";
      const mutedRaw = style.getPropertyValue("--muted").trim() || "156 156 156";
      const lineStrongRaw = style.getPropertyValue("--line-strong").trim() || "68 68 68";

      const hovered = hoverRef.current;
      const targetSpeed = hovered ? 0.026 : 0.0065;
      const targetScale = hovered ? 1.09 : 1.0;

      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      currentScale += (targetScale - currentScale) * 0.08;
      smoothTiltX += (tiltRef.current.x * 0.55 - smoothTiltX) * 0.08;
      smoothTiltY += (tiltRef.current.y * 0.55 - smoothTiltY) * 0.08;

      rotY += currentSpeed;
      rotX = -0.32 + smoothTiltY + Math.sin(rotY * 0.5) * 0.08;
      rotZ = 0.18 + smoothTiltX;

      const cx = width / 2;
      const cy = height / 2;
      const sphereRadius = Math.min(width, height) * 0.43 * currentScale;
      const fov = sphereRadius * 3.2;

      // 1. Draw Crisp 3D Orbital Great-Circle Rings (No Glow)
      ringTilts.forEach((ring, rIdx) => {
        const steps = 64;
        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const angle = (s / steps) * Math.PI * 2;
          let px = Math.cos(angle) * sphereRadius;
          let py = 0;
          let pz = Math.sin(angle) * sphereRadius;

          // Apply ring intrinsic tilt
          const tilted = rotatePoint(px, py, pz, ring.rx, 0, ring.rz);
          // Apply global sphere rotation
          const world = rotatePoint(
            tilted.x,
            tilted.y,
            tilted.z,
            rotX,
            rotY * (rIdx % 2 === 0 ? 1 : -0.8),
            rotZ
          );

          const perspective = fov / (fov - world.z * 0.45);
          const sx = cx + world.x * perspective;
          const sy = cy + world.y * perspective;

          if (s === 0) {
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.strokeStyle = hovered
          ? `rgb(${mutedRaw} / 0.55)`
          : `rgb(${lineStrongRaw} / 0.65)`;
        ctx.lineWidth = hovered ? 1.15 : 1;
        ctx.stroke();
      });

      // 2. Compute and Depth-Sort 3D Orbs
      const projectedOrbs: {
        sx: number;
        sy: number;
        z: number;
        r: number;
        isRingOrb: boolean;
      }[] = [];

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        let world: { x: number; y: number; z: number };

        if (orb.ringIndex >= 0) {
          const ring = ringTilts[orb.ringIndex];
          const dynamicTheta = orb.theta + rotY * orb.speedOffset;
          const px = Math.cos(dynamicTheta) * sphereRadius;
          const py = 0;
          const pz = Math.sin(dynamicTheta) * sphereRadius;
          const tilted = rotatePoint(px, py, pz, ring.rx, 0, ring.rz);
          world = rotatePoint(
            tilted.x,
            tilted.y,
            tilted.z,
            rotX,
            rotY * (orb.ringIndex % 2 === 0 ? 1 : -0.8),
            rotZ
          );
        } else {
          const sinPhi = Math.sin(orb.phi);
          const px = sphereRadius * sinPhi * Math.cos(orb.theta);
          const py = sphereRadius * Math.cos(orb.phi);
          const pz = sphereRadius * sinPhi * Math.sin(orb.theta);
          world = rotatePoint(px, py, pz, rotX, rotY, rotZ);
        }

        const perspective = fov / (fov - world.z * 0.45);
        const sx = cx + world.x * perspective;
        const sy = cy + world.y * perspective;
        const depthNorm = (world.z / sphereRadius + 1) * 0.5; // 0 (back) to 1 (front)
        const r = Math.max(
          1.1,
          orb.baseRadius * (0.55 + depthNorm * 0.75) * (hovered ? 1.15 : 1.0)
        );

        projectedOrbs.push({
          sx,
          sy,
          z: world.z,
          r,
          isRingOrb: orb.ringIndex >= 0,
        });
      }

      // Sort back-to-front
      projectedOrbs.sort((a, b) => a.z - b.z);

      // 3. Draw Solid Orbs (Zero Glow, Crisp Monochrome)
      for (let i = 0; i < projectedOrbs.length; i++) {
        const p = projectedOrbs[i];
        const depthNorm = Math.max(0, Math.min(1, (p.z / sphereRadius + 1) * 0.5));
        const alpha = (0.22 + depthNorm * 0.78) * (hovered ? 1 : 0.88);

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.r, 0, Math.PI * 2);

        if (p.isRingOrb && depthNorm > 0.5) {
          ctx.fillStyle = `rgb(${inkRaw} / ${Math.min(1, alpha + 0.15)})`;
        } else if (depthNorm > 0.62) {
          ctx.fillStyle = `rgb(${inkRaw} / ${alpha.toFixed(2)})`;
        } else {
          ctx.fillStyle = `rgb(${mutedRaw} / ${alpha.toFixed(2)})`;
        }
        ctx.fill();

        // Crisp subtle ring around front-most satellite orbs when hovered
        if (hovered && p.isRingOrb && depthNorm > 0.65) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, p.r + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgb(${inkRaw} / 0.45)`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
