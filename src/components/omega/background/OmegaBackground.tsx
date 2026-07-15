"use client";

import { useEffect, useRef } from "react";
import { useMotionStore } from "../store/motion-store";
import { useReducedMotion } from "../hooks/use-omega";
import { DustParticles } from "./DustParticles";
import "./omega-background.css";

/**
 * <OmegaBackground/> — the living animated background for Omega.
 *
 * A fixed, full-viewport, non-interactive (pointer-events:none, z-index:-20)
 * stack of cinematic layers that breathe and parallax without ever stealing
 * focus from foreground content.
 *
 * Layers (back → front):
 *   1. Base obsidian wash (solid + upper-center radial lift)
 *   2. Aurora triad — 3 huge soft blobs (emerald / amber / rose), screen blend
 *   3. Floating gradient mesh — 2–3 smaller brighter blobs, screen blend
 *   4. Volumetric light rays — 2–3 thin near-vertical beams, screen blend
 *   5. Dust particles — canvas of ~55 drifting motes
 *   6. Depth fog + vignette overlays
 *   7. Film grain — global .omega-noise SVG, overlay blend, micro-jitter
 *
 * Parallax / reactivity:
 *   A SINGLE rAF loop reads `useMotionStore.getState()` (non-reactive) and
 *   writes `transform` directly to layer refs — never via React state, so the
 *   component never re-renders at 60fps. Values are smoothed (lerp 0.08) for
 *   buttery follow.
 *     - aurora layer: translate(nx*20, ny*20 + progress*60)
 *     - mesh layer:   translate(nx*-12, ny*-12)   (counter-parallax = depth)
 *     - rays layer:   rotate(nx*3deg)
 *     - dust layer:   translate(nx*10, ny*8)      (factor ~0.5 vs aurora)
 *
 * Reduced motion:
 *   Renders a static subset only — base wash, a single static aurora radial,
 *   vignette + fog, and the grain. No rAF, no canvas, no CSS keyframe drift.
 *
 * Performance:
 *   - Only transform/opacity animated (GPU).
 *   - `will-change: transform` on every animated layer.
 *   - Canvas DPR capped at 2 (inside DustParticles).
 *   - Canvas rAF pauses when the tab is hidden.
 *   - SSR-safe: canvas init guarded by typeof window; layers render inert.
 */
export function OmegaBackground() {
  const auroraLayerRef = useRef<HTMLDivElement>(null);
  const meshLayerRef = useRef<HTMLDivElement>(null);
  const raysLayerRef = useRef<HTMLDivElement>(null);
  const dustLayerRef = useRef<HTMLDivElement>(null);

  // re-renders only when the flag actually flips — cheap, not per-frame
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return; // static render path — no rAF

    // smoothed accumulators
    let cx = 0; // aurora x
    let cy = 0; // aurora y
    let cp = 0; // aurora progress-y
    let mx = 0; // mesh x
    let my = 0; // mesh y
    let rRot = 0; // rays rotation (deg)
    let dx = 0; // dust x
    let dy = 0; // dust y
    let raf = 0;

    const loop = () => {
      const { nx, ny, progress } = useMotionStore.getState();

      // targets
      const tAx = nx * 20;
      const tAy = ny * 20;
      const tAp = progress * 60;
      const tMx = nx * -12;
      const tMy = ny * -12;
      const tRot = nx * 3; // ±3deg
      const tDx = nx * 10; // ~0.5 factor vs aurora
      const tDy = ny * 8;

      // ease toward targets (critically-damped-ish, frame-rate tolerant)
      const k = 0.08;
      cx += (tAx - cx) * k;
      cy += (tAy - cy) * k;
      cp += (tAp - cp) * k;
      mx += (tMx - mx) * k;
      my += (tMy - my) * k;
      rRot += (tRot - rRot) * k;
      dx += (tDx - dx) * k;
      dy += (tDy - dy) * k;

      const aurora = auroraLayerRef.current;
      if (aurora) {
        aurora.style.transform = `translate3d(${cx.toFixed(2)}px, ${(cy + cp).toFixed(2)}px, 0)`;
      }
      const mesh = meshLayerRef.current;
      if (mesh) {
        mesh.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
      }
      const rays = raysLayerRef.current;
      if (rays) {
        rays.style.transform = `rotate(${rRot.toFixed(3)}deg)`;
      }
      const dust = dustLayerRef.current;
      if (dust) {
        dust.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (reduced) {
    // Static, calm subset — no animation, no canvas.
    return (
      <div className="omega-bg-root" aria-hidden="true">
        <div className="omega-bg-base" />
        <div className="omega-bg-static-aurora" />
        <div className="omega-bg-vignette" />
        <div className="omega-bg-fog" />
        <div className="omega-bg-grain omega-noise" />
      </div>
    );
  }

  return (
    <div className="omega-bg-root" aria-hidden="true">
      {/* 1. Base obsidian wash */}
      <div className="omega-bg-base" />

      {/* 2. Aurora triad */}
      <div ref={auroraLayerRef} className="omega-bg-layer omega-bg-aurora-layer">
        <div className="omega-bg-aurora-blob omega-bg-aurora-1" />
        <div className="omega-bg-aurora-blob omega-bg-aurora-2" />
        <div className="omega-bg-aurora-blob omega-bg-aurora-3" />
      </div>

      {/* 3. Floating gradient mesh */}
      <div ref={meshLayerRef} className="omega-bg-layer omega-bg-mesh-layer">
        <div className="omega-bg-mesh-blob omega-bg-mesh-1" />
        <div className="omega-bg-mesh-blob omega-bg-mesh-2" />
        <div className="omega-bg-mesh-blob omega-bg-mesh-3" />
      </div>

      {/* 4. Volumetric light rays */}
      <div ref={raysLayerRef} className="omega-bg-layer omega-bg-rays-layer">
        <div className="omega-bg-ray omega-bg-ray-1" />
        <div className="omega-bg-ray omega-bg-ray-2" />
        <div className="omega-bg-ray omega-bg-ray-3" />
      </div>

      {/* 5. Dust particles */}
      <div ref={dustLayerRef} className="omega-bg-layer omega-bg-dust-layer">
        <DustParticles count={55} />
      </div>

      {/* 6. Depth fog + vignette */}
      <div className="omega-bg-vignette" />
      <div className="omega-bg-fog" />

      {/* 7. Film grain noise */}
      <div className="omega-bg-grain omega-noise" />
    </div>
  );
}

export default OmegaBackground;
