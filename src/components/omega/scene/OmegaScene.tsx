"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "../hooks/use-omega";

// WebGL canvas is client-only — never SSR'd.
const OmegaCanvas = dynamic(() => import("./OmegaCanvas"), {
  ssr: false,
  loading: () => null,
});

/**
 * OmegaScene — mounts the 3D canvas (or a graceful CSS fallback) as a fixed,
 * full-viewport, non-interactive layer between the background and content.
 *
 * z-index: 0 (background is -20, content is 10). pointer-events:none so all
 * interaction passes through to the UI.
 *
 * Reduced motion: renders a static CSS "orb" (radial gradients + ring) so the
 * hero still has a centerpiece without WebGL / animation.
 */
export function OmegaScene() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
      >
        <div className="relative h-[360px] w-[360px]">
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, oklch(0.82 0.17 162 / 0.55), oklch(0.7 0.21 14 / 0.25) 55%, transparent 72%)",
            }}
          />
          <div
            className="absolute inset-[18%] rounded-full border"
            style={{ borderColor: "oklch(0.82 0.17 162 / 0.4)" }}
          />
          <div
            className="absolute inset-[34%] rounded-full border"
            style={{ borderColor: "oklch(0.85 0.15 82 / 0.3)" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <OmegaCanvas />
    </div>
  );
}

export default OmegaScene;
