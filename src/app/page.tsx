"use client";

import { OmegaMotionProvider } from "@/components/omega/providers/OmegaMotionProvider";
import { OmegaBackground } from "@/components/omega/background/OmegaBackground";
import { OmegaScene } from "@/components/omega/scene/OmegaScene";
import { OmegaCursor } from "@/components/omega/cursor/OmegaCursor";
import { OmegaNav } from "@/components/omega/sections/OmegaNav";
import { OmegaHero } from "@/components/omega/sections/OmegaHero";
import { OmegaCapabilities } from "@/components/omega/sections/OmegaCapabilities";
import { OmegaNeural } from "@/components/omega/sections/OmegaNeural";
import { OmegaConsole } from "@/components/omega/sections/OmegaConsole";
import { OmegaCTA } from "@/components/omega/sections/OmegaCTA";
import { OmegaPricing } from "@/components/omega/sections/OmegaPricing";
import { OmegaFooter } from "@/components/omega/sections/OmegaFooter";
import { OmegaLogin } from "@/components/omega/sections/OmegaLogin";
import { useOAuth } from "@/components/omega/hooks/use-oauth";
import { useChatStore } from "@/components/omega/store/chat-store";
import { useAuthStore } from "@/components/omega/store/auth-store";
import { useEffect } from "react";

/**
 * Landing page for Omega. Mounts the OAuth lifecycle (PKCE redirect handling
 * + session restore), the cinematic motion layers, all marketing sections,
 * and the login overlay. After successful auth the user is sent to /chat.
 */
export default function Home() {
  const { user, ready } = useOAuth();
  const openLoginOverlay = useAuthStore((s) => s.openLoginOverlay);

  // Hydrate chat sessions once on the client.
  useEffect(() => {
    useChatStore.getState().hydrateFromStorage();
  }, []);

  // If bounced back from /chat with ?needAuth=1, open the login overlay.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("needAuth") === "1") {
      openLoginOverlay();
      // clean the URL
      window.history.replaceState(null, "", "/");
    }
  }, [openLoginOverlay]);

  // Once auth is ready and the user is signed in, move them to /chat
  // (unless they're mid-OAuth-handling — use-oauth does its own replaceState).
  useEffect(() => {
    if (ready && user) {
      const t = setTimeout(() => {
        if (window.location.pathname !== "/chat") {
          window.location.href = "/chat";
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [ready, user]);

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
          <OmegaCTA />
        </main>
        <OmegaFooter />
      </div>

      {/* Login overlay (z-80, above cursor) */}
      <OmegaLogin />
    </OmegaMotionProvider>
  );
}
