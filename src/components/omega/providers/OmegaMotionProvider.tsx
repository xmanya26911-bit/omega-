"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useMotionStore } from "../store/motion-store";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Bootstraps the global motion system:
 *  - Lenis smooth scroll (drives native scroll, so Motion's useScroll still works)
 *  - single rAF loop feeding the motion store (pointer + scroll + viewport)
 *  - prefers-reduced-motion + pointer:fine detection
 *  - disables smooth scroll under reduced motion
 *
 * Must be rendered once near the top of the page tree.
 */
export function OmegaMotionProvider({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const store = useMotionStore.getState();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    store.setReducedMotion(reduced);
    store.setPointerFine(fine);
    store.setViewport(window.innerWidth, window.innerHeight);

    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        lerp: 0.1,
      });
      window.__lenis = lenis;
    }

    let lastScroll = window.scrollY;
    const loop = (time: number) => {
      if (lenis) lenis.raf(time);
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const velocity = y - lastScroll;
      lastScroll = y;
      const progress = Math.min(1, Math.max(0, y / max));
      useMotionStore.getState().setScroll(y, velocity, progress);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onPointer = (e: PointerEvent) => {
      useMotionStore.getState().setPointer(e.clientX, e.clientY);
    };
    const onResize = () => {
      useMotionStore.getState().setViewport(window.innerWidth, window.innerHeight);
    };
    const onMQReduced = (e: MediaQueryListEvent) => useMotionStore.getState().setReducedMotion(e.matches);
    const onMQFine = (e: MediaQueryListEvent) => useMotionStore.getState().setPointerFine(e.matches);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", onResize);
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqFine = window.matchMedia("(pointer: fine)");
    mqReduced.addEventListener("change", onMQReduced);
    mqFine.addEventListener("change", onMQFine);

    useMotionStore.getState().setReady(true);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (lenis) {
        lenis.destroy();
        window.__lenis = undefined;
      }
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      mqReduced.removeEventListener("change", onMQReduced);
      mqFine.removeEventListener("change", onMQFine);
    };
  }, []);

  return <>{children}</>;
}
