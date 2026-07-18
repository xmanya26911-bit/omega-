"use client";

import { OmegaMotionProvider } from "@/components/omega/providers/OmegaMotionProvider";
import { OmegaBackground } from "@/components/omega/background/OmegaBackground";
import { OmegaScene } from "@/components/omega/scene/OmegaScene";
import { OmegaCursor } from "@/components/omega/cursor/OmegaCursor";
import { OmegaNav } from "@/components/omega/sections/OmegaNav";
import { OmegaHero } from "@/components/omega/sections/OmegaHero";
import dynamic from "next/dynamic";
import { OmegaCapabilities } from "@/components/omega/sections/OmegaCapabilities";
import { OmegaCTA } from "@/components/omega/sections/OmegaCTA";
import { OmegaPricing } from "@/components/omega/sections/OmegaPricing";
import { OmegaFooter } from "@/components/omega/sections/OmegaFooter";

// Below-the-fold sections: code-split for faster initial paint.
// Each loads its own chunk on demand (scroll/hover/idle).
const OmegaNeural = dynamic(
  () => import("@/components/omega/sections/OmegaNeural").then((m) => m.OmegaNeural),
  { ssr: false, loading: () => <section id="neural" className="min-h-[60vh]" /> }
);
const OmegaConsole = dynamic(
  () => import("@/components/omega/sections/OmegaConsole").then((m) => m.OmegaConsole),
  { ssr: false, loading: () => <section id="console" className="min-h-[60vh]" /> }
);
const OmegaMarketplace = dynamic(
  () => import("@/components/omega/sections/OmegaMarketplace").then((m) => m.OmegaMarketplace),
  { ssr: false, loading: () => <section id="marketplace" className="min-h-[60vh]" /> }
);

/**
 * Landing page for Omega. Pure marketing page — no auth logic.
 * "Begin" CTA redirects to chat app which handles all authentication.
 */
export default function Home() {
  return (
    <OmegaMotionProvider>
      {/* Fixed cinematic layers (behind / above content) */}
      <OmegaBackground />
      <OmegaScene />
      <OmegaCursor />

      {/* Content layer */}
      <div id="top" className="relative z-10 flex min-h-screen flex-col">
        {/* Skip-to-content link — visible on keyboard focus, hidden otherwise */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-[var(--omega-emerald)]/40 focus:bg-[var(--omega-bg)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--omega-emerald)]"
        >
          Skip to content
        </a>
        <OmegaNav />
        <main id="main-content" className="flex-1">
          <OmegaHero />
          <OmegaCapabilities />
          <OmegaNeural />
          <OmegaConsole />
          <OmegaPricing />
          <OmegaMarketplace />
          <OmegaCTA />
        </main>
        <OmegaFooter />
      </div>
    </OmegaMotionProvider>
  );
}
