"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMotionStore } from "../store/motion-store";

/* ───────────────────────────────────────────────────────────────────────────
 * OmegaCursor — premium custom cursor for the Omega cinematic OS.
 *
 * Activates ONLY on fine-pointer devices without reduced-motion. Replaces the
 * native cursor (via the `omega-custom-cursor-active` body class declared in
 * globals.css) and layers four tactile elements:
 *
 *   1. Spotlight   — 480px radial emerald glow, mix-blend-mode: screen, trails.
 *   2. Glass patch — 160px backdrop-blurred disc refracting the scene beneath.
 *   3. Outer ring  — 36px emerald ring, smooth lerp, magnetic hover morph.
 *   4. Inner dot   — 6px solid dot, near-instant tracking, press feedback.
 *
 * Plus click ripples (WAAPI) and idle breathing.
 *
 * Performance: ONE rAF loop reads useMotionStore.getState() per frame (no
 * reactive subscription for per-frame data) and mutates element transforms /
 * opacities via refs. Ripples are the only React-state-driven piece.
 *
 * The spotlight + glass patch are rendered as SIBLINGS of the cursor root
 * (not children) so that mix-blend-mode: screen and backdrop-filter composite
 * against the page content rather than being isolated by the root's stacking
 * context. Everything is portaled to document.body for stacking robustness.
 * ─────────────────────────────────────────────────────────────────────────── */

type CursorState = "default" | "hover" | "view";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/** Elements that trigger the magnetic "hover" cursor state. */
const HOVER_SELECTOR =
  "a, button, [role='button'], input, textarea, select, [data-cursor]";

// Element sizes (px).
const RING_SIZE = 36;
const DOT_SIZE = 6;
const SPOT_SIZE = 480;
const GLASS_SIZE = 160;

// Lerp factors (per-frame easing toward target).
const LERP_RING = 0.18; // ring trails noticeably
const LERP_DOT = 0.6; // dot near-instant
const LERP_SPOT = 0.1; // spotlight trails most (ambient light lag)
const LERP_GLASS = 0.3; // glass between ring and dot
const LERP_STATE = 0.15; // scale / color crossfade
const LERP_OPACITY = 0.12; // reveal fade-in

// Z-index layering (within the cursor system; root stacking context is body).
const Z_SPOT = 55;
const Z_GLASS = 56;
const Z_ROOT = 60;

const CSS = `
.omega-cursor-spot {
  position: fixed;
  top: 0; left: 0;
  width: ${SPOT_SIZE}px; height: ${SPOT_SIZE}px;
  border-radius: 50%;
  background: radial-gradient(circle,
    oklch(0.82 0.17 162 / 0.14) 0%,
    oklch(0.82 0.17 162 / 0.06) 36%,
    transparent 66%);
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: ${Z_SPOT};
  will-change: transform, opacity;
}
.omega-cursor-glass {
  position: fixed;
  top: 0; left: 0;
  width: ${GLASS_SIZE}px; height: ${GLASS_SIZE}px;
  border-radius: 50%;
  border: 1px solid oklch(0.92 0.02 90 / 0.08);
  box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.05);
  backdrop-filter: blur(6px) saturate(140%);
  -webkit-backdrop-filter: blur(6px) saturate(140%);
  pointer-events: none;
  z-index: ${Z_GLASS};
  will-change: transform, opacity;
}
.omega-cursor-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_ROOT};
}
.omega-cursor-ring {
  position: absolute;
  top: 0; left: 0;
  width: ${RING_SIZE}px; height: ${RING_SIZE}px;
  will-change: transform, opacity;
}
.omega-cursor-ring-base,
.omega-cursor-ring-hover {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid var(--omega-emerald);
  box-shadow:
    0 0 14px -2px oklch(0.82 0.17 162 / 0.55),
    inset 0 0 10px -4px oklch(0.82 0.17 162 / 0.35);
  transition: border-radius 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity;
}
.omega-cursor-ring-hover {
  border-color: var(--omega-amber);
  box-shadow:
    0 0 16px -2px oklch(0.85 0.15 82 / 0.6),
    inset 0 0 10px -4px oklch(0.85 0.15 82 / 0.35);
  opacity: 0;
}
.omega-cursor-ring.omega-cursor-view .omega-cursor-ring-base,
.omega-cursor-ring.omega-cursor-view .omega-cursor-ring-hover {
  border-radius: 7px;
}
.omega-cursor-dot {
  position: absolute;
  top: 0; left: 0;
  width: ${DOT_SIZE}px; height: ${DOT_SIZE}px;
  border-radius: 50%;
  background: var(--omega-emerald);
  box-shadow:
    0 0 8px 0 oklch(0.82 0.17 162 / 0.85),
    0 0 20px -2px oklch(0.82 0.17 162 / 0.55);
  will-change: transform, opacity;
}
.omega-cursor-ripple {
  position: absolute;
  width: 42px; height: 42px;
  border-radius: 50%;
  border: 1.5px solid var(--omega-emerald);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0.6;
  pointer-events: none;
  will-change: transform, opacity;
}
`;

/** A single click ripple. Self-animates via WAAPI and unmounts via parent. */
function RippleEl({ x, y }: { x: number; y: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const anim = el.animate(
      [
        { transform: "translate(-50%, -50%) scale(0)", opacity: 0.6 },
        { transform: "translate(-50%, -50%) scale(3)", opacity: 0 },
      ],
      { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    );
    return () => anim.cancel();
  }, []);
  return <div ref={ref} className="omega-cursor-ripple" style={{ left: x, top: y }} />;
}

export function OmegaCursor() {
  const [active, setActive] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const spotRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringBaseRef = useRef<HTMLDivElement>(null);
  const ringHoverRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  /* ── Activation guard: ready && pointerFine && !reducedMotion ──────────
   * Reactive subscription ONLY for these infrequent flags (not per-frame
   * pointer data). Adds `omega-custom-cursor-active` to <body> to hide the
   * native cursor (scoped to `@media (pointer: fine)` in globals.css). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let curReady = useMotionStore.getState().ready;
    let curFine = useMotionStore.getState().pointerFine;
    let curReduced = useMotionStore.getState().reducedMotion;

    const apply = () => {
      const ok = curReady && curFine && !curReduced;
      setActive((prev) => (prev === ok ? prev : ok));
      if (ok) document.body.classList.add("omega-custom-cursor-active");
      else document.body.classList.remove("omega-custom-cursor-active");
    };
    apply();

    const unsub = useMotionStore.subscribe((s) => {
      let changed = false;
      if (s.ready !== curReady) { curReady = s.ready; changed = true; }
      if (s.pointerFine !== curFine) { curFine = s.pointerFine; changed = true; }
      if (s.reducedMotion !== curReduced) { curReduced = s.reducedMotion; changed = true; }
      if (changed) apply();
    });

    return () => {
      unsub();
      document.body.classList.remove("omega-custom-cursor-active");
    };
  }, []);

  /* ── Main rAF loop + interaction listeners (mounted only when active) ── */
  useEffect(() => {
    if (!active) return;
    const spot = spotRef.current;
    const glass = glassRef.current;
    const ring = ringRef.current;
    const ringBase = ringBaseRef.current;
    const ringHover = ringHoverRef.current;
    const dot = dotRef.current;
    if (!spot || !glass || !ring || !ringBase || !ringHover || !dot) return;

    // Initialize positions to the current pointer to avoid a corner sweep.
    const init = useMotionStore.getState();
    let rx = init.px, ry = init.py;
    let dx = init.px, dy = init.py;
    let sx = init.px, sy = init.py;
    let gx = init.px, gy = init.py;

    // Visual state (current + lerped targets).
    let ringScale = 1, ringScaleT = 1;
    let dotScale = 1, dotScaleT = 1;
    let colorMix = 0, colorMixT = 0; // 0 = emerald, 1 = amber
    // Reveal immediately if the pointer is already at a real position; otherwise
    // wait for the first move so the cursor fades in gracefully (no corner pop).
    let opacity = 0, opacityT = init.px !== 0 || init.py !== 0 ? 1 : 0;
    let revealed = false;
    let isView = false;

    const lastPos = { x: init.px, y: init.py };
    let lastMove = performance.now();
    let pressed = false;
    let rippleId = 0;

    const setState = (st: CursorState) => {
      if (st === "hover") {
        ringScaleT = 2.0; dotScaleT = 0.3; colorMixT = 1;
      } else if (st === "view") {
        ringScaleT = 2.6; dotScaleT = 0; colorMixT = 1;
      } else {
        ringScaleT = 1; dotScaleT = 1; colorMixT = 0;
      }
      const wantView = st === "view";
      if (wantView !== isView) {
        isView = wantView;
        ring.classList.toggle("omega-cursor-view", wantView);
      }
    };

    const detect = (e: PointerEvent): CursorState => {
      const t = e.target as Element | null;
      if (!t || typeof t.closest !== "function") return "default";
      const m = t.closest(HOVER_SELECTOR) as HTMLElement | null;
      if (!m) return "default";
      const v = m.getAttribute("data-cursor");
      if (v === "view") return "view";
      return "hover";
    };

    const onOver = (e: PointerEvent) => setState(detect(e));
    const onOut = (e: PointerEvent) => {
      const rt = e.relatedTarget as Element | null;
      if (
        !rt ||
        typeof rt.closest !== "function" ||
        !rt.closest(HOVER_SELECTOR)
      ) {
        setState("default");
      }
    };
    const onDown = (e: PointerEvent) => {
      pressed = true;
      const id = ++rippleId;
      const x = e.clientX;
      const y = e.clientY;
      setRipples((r) => [...r, { id, x, y }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((rr) => rr.id !== id));
      }, 660);
    };
    const onUp = () => { pressed = false; };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    let raf = 0;
    const loop = () => {
      const { px, py } = useMotionStore.getState();

      // Movement / idle tracking.
      if (px !== lastPos.x || py !== lastPos.y) {
        lastPos.x = px;
        lastPos.y = py;
        lastMove = performance.now();
        opacityT = 1; // reveal once the pointer actually moves
      }

      // Lerp positions toward the pointer.
      rx += (px - rx) * LERP_RING;
      ry += (py - ry) * LERP_RING;
      dx += (px - dx) * LERP_DOT;
      dy += (py - dy) * LERP_DOT;
      sx += (px - sx) * LERP_SPOT;
      sy += (py - sy) * LERP_SPOT;
      gx += (px - gx) * LERP_GLASS;
      gy += (py - gy) * LERP_GLASS;

      // Lerp visual state.
      ringScale += (ringScaleT - ringScale) * LERP_STATE;
      dotScale += (dotScaleT - dotScale) * LERP_STATE;
      colorMix += (colorMixT - colorMix) * LERP_STATE;
      opacity += (opacityT - opacity) * LERP_OPACITY;

      // Idle breathing on the ring (subtle scale pulse after 1.2s still).
      const idle = performance.now() - lastMove;
      let breath = 1;
      if (idle > 1200) {
        breath = 1 + Math.sin((idle - 1200) / 380) * 0.06;
      }

      // Press feedback: compress the dot on pointerdown.
      const press = pressed ? 0.7 : 1;

      // Apply transforms (translate3d + scale only — GPU friendly).
      ring.style.transform =
        `translate3d(${(rx - RING_SIZE / 2).toFixed(2)}px, ${(ry - RING_SIZE / 2).toFixed(2)}px, 0) scale(${(ringScale * breath).toFixed(4)})`;
      dot.style.transform =
        `translate3d(${(dx - DOT_SIZE / 2).toFixed(2)}px, ${(dy - DOT_SIZE / 2).toFixed(2)}px, 0) scale(${(dotScale * press).toFixed(4)})`;
      spot.style.transform =
        `translate3d(${(sx - SPOT_SIZE / 2).toFixed(2)}px, ${(sy - SPOT_SIZE / 2).toFixed(2)}px, 0)`;
      glass.style.transform =
        `translate3d(${(gx - GLASS_SIZE / 2).toFixed(2)}px, ${(gy - GLASS_SIZE / 2).toFixed(2)}px, 0)`;

      // Crossfade ring border color (emerald ↔ amber) via stacked layers.
      ringBase.style.opacity = (1 - colorMix).toFixed(3);
      ringHover.style.opacity = colorMix.toFixed(3);

      // Reveal opacity (fade-in on first move); skip writes once fully shown.
      if (!revealed) {
        const o = opacity.toFixed(3);
        spot.style.opacity = o;
        glass.style.opacity = o;
        ring.style.opacity = o;
        dot.style.opacity = o;
        if (opacity > 0.999) revealed = true;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      setRipples([]); // drop stale ripples on deactivation
    };
  }, [active]);

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <>
      <style>{CSS}</style>
      <div ref={spotRef} className="omega-cursor-spot" aria-hidden="true" />
      <div ref={glassRef} className="omega-cursor-glass" aria-hidden="true" />
      <div className="omega-cursor-root" aria-hidden="true">
        {ripples.map((r) => (
          <RippleEl key={r.id} x={r.x} y={r.y} />
        ))}
        <div ref={ringRef} className="omega-cursor-ring">
          <div ref={ringBaseRef} className="omega-cursor-ring-base" />
          <div ref={ringHoverRef} className="omega-cursor-ring-hover" />
        </div>
        <div ref={dotRef} className="omega-cursor-dot" />
      </div>
    </>,
    document.body
  );
}

export default OmegaCursor;
