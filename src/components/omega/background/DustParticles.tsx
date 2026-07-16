"use client";

import { useEffect, useRef } from "react";

/**
 * <DustParticles/> — canvas-rendered floating dust motes.
 *
 * - ~55 tiny specks (1–2px) drifting upward with sin-wave horizontal sway.
 * - Each particle owns its own speed / phase / sway amplitude / alpha / hue.
 * - White + emerald tints, low alpha, subtle flicker.
 * - DPR capped at 2. Sizes itself from its own bounding rect so it can fill
 *   an oversized parent (the dust layer uses inset: -15% for parallax headroom).
 * - Independent rAF loop; the parent layer's parallax is applied as a CSS
 *   transform on the wrapper (GPU-friendly, no per-frame React state).
 * - SSR-safe: effect never runs server-side; canvas renders inert on SSR.
 */
interface DustParticle {
  x: number;
  y: number;
  size: number;
  /** upward drift speed (px/s) */
  speed: number;
  /** sway phase (radians) */
  phase: number;
  /** sway amplitude (px) */
  swayAmp: number;
  /** base alpha 0..1 */
  alpha: number;
  /** 0 = warm white, 1 = emerald */
  tint: 0 | 1;
  /** flicker frequency (rad/s) */
  flick: number;
}

export function DustParticles({ count = 55 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let dpr = 1;
    let w = 0;
    let h = 0;
    let particles: DustParticle[] = [];

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const seed = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(0.6, 2.0),
          speed: rand(6, 20),
          phase: Math.random() * Math.PI * 2,
          swayAmp: rand(6, 20),
          alpha: rand(0.16, 0.5),
          tint: Math.random() > 0.62 ? 1 : 0,
          flick: rand(0.6, 2.4),
        });
      }
    };

    const resize = () => {
      // Measure the canvas's own box (parent is oversized for parallax).
      const rect = canvas.getBoundingClientRect();
      w = rect.width || window.innerWidth;
      h = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) seed();
    };

    resize();
    // Re-seed after first measure so initial spread matches real size.
    seed();

    let raf = 0;
    let last = performance.now();
    let running = true;

    // Pause when tab hidden — cheap perf win.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        last = performance.now();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!running) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed * dt;
        p.phase += dt * 0.6;
        if (p.y < -8) {
          // wrap to bottom with a fresh x
          p.y = h + 8;
          p.x = Math.random() * w;
        }
        const swayX = p.x + Math.sin(p.phase) * p.swayAmp;
        const flicker = 0.65 + Math.sin(now * 0.001 * p.flick + p.phase) * 0.35;
        const a = p.alpha * flicker;

        ctx.beginPath();
        ctx.arc(swayX, p.y, p.size, 0, Math.PI * 2);
        if (p.tint === 1) {
          ctx.fillStyle = `rgba(132, 240, 188, ${a.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(244, 246, 238, ${a.toFixed(3)})`;
        }
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      seed();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="omega-bg-dust-canvas"
    />
  );
}

export default DustParticles;
