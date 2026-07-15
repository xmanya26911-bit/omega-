"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { RevealText } from "../ui/RevealText";
import { OmegaButton } from "../ui/OmegaButton";
import { useLenisScroll } from "../hooks/use-omega";
import { useAuthStore } from "../store/auth-store";

/**
 * OmegaCTA — the closing cinematic call-to-action.
 * A perspective-zoom "depth dissolve" into a vast aurora field, with a single
 * decisive prompt: Begin.
 */
export function OmegaCTA() {
  const ref = useRef<HTMLElement>(null);
  const scrollTo = useLenisScroll();
  const openLoginOverlay = useAuthStore((s) => s.openLoginOverlay);
  const user = useAuthStore((s) => s.user);

  const handleBegin = () => {
    if (user) {
      // already signed in → go straight to chat
      window.location.href = "/chat";
    } else {
      openLoginOverlay();
    }
  };
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);
  const glowY = useTransform(scrollYProgress, [0, 1], [80, -20]);

  return (
    <section
      ref={ref}
      className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-32 text-center sm:py-44"
    >
      {/* depth glow */}
      <motion.div
        style={{ y: glowY }}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[760px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[100px]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(ellipse_at_center,var(--omega-emerald)_0%,var(--omega-rose)_45%,transparent_70%)] opacity-50" />
      </motion.div>

      <motion.div style={{ scale, opacity }} className="relative flex flex-col items-center">
        <RevealText
          as="h2"
          text="Step into Omega"
          className="font-display text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1] tracking-tight"
          wordClassName="omega-text-aurora"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-base leading-relaxed text-[var(--omega-fg-dim)] sm:text-lg"
        >
          One runtime. Every modality. Built to feel like the future of
          computing — because it is.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <OmegaButton size="lg" className="group" onClick={handleBegin}>
            Begin
            <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-[oklch(0.06_0.01_264)] text-[var(--omega-emerald)] transition-transform duration-300 group-hover:rotate-90">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </OmegaButton>
          <OmegaButton size="lg" variant="outline" onClick={() => scrollTo("#overview")}>
            Back to top
          </OmegaButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
