"use client";

import { OmegaMotionProvider } from "@/components/omega/providers/OmegaMotionProvider";
import { OmegaBackground } from "@/components/omega/background/OmegaBackground";
import { OmegaScene } from "@/components/omega/scene/OmegaScene";
import { OmegaCursor } from "@/components/omega/cursor/OmegaCursor";
import { OmegaNav } from "@/components/omega/sections/OmegaNav";
import { OmegaHero } from "@/components/omega/sections/OmegaHero";
import dynamic from "next/dynamic";
import { OmegaCapabilities } from "@/components/omega/sections/OmegaCapabilities";
import { OmegaNeural } from "@/components/omega/sections/OmegaNeural";
import { OmegaConsole } from "@/components/omega/sections/OmegaConsole";
import { OmegaCTA } from "@/components/omega/sections/OmegaCTA";
import { OmegaPricing } from "@/components/omega/sections/OmegaPricing";
const OmegaMarketplace = dynamic(
  () => import("@/components/omega/sections/OmegaMarketplace").then((m) => m.OmegaMarketplace),
  { ssr: false }
);
import { OmegaFooter } from "@/components/omega/sections/OmegaFooter";

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
        <OmegaNav />
        <main className="flex-1">
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
