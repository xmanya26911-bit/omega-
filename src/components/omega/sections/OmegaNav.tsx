"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useMagnetic, useLenisScroll } from "../hooks/use-omega";
import { OmegaButton } from "../ui/OmegaButton";

const LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Neural", href: "#neural" },
  { label: "Console", href: "#console" },
];

/**
 * OmegaNav — layered floating glass navigation.
 *  - lifts into a denser glass on scroll
 *  - magnetic Ω logo + wordmark
 *  - links with animated underline glow
 *  - launch CTA
 *  - integrated top scroll-progress filament
 */
export function OmegaNav() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const filament = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const scrollTo = useLenisScroll();

  const logoRef = useMagnetic<HTMLAnchorElement>(0.4, 90);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 sm:pt-5"
    >
      <div
        ref={ref}
        className="omega-glass flex w-full max-w-6xl items-center justify-between rounded-full px-3 py-2.5 pl-5 sm:px-4"
      >
        {/* Logo */}
        <a
          ref={logoRef}
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollTo(0);
          }}
          data-cursor="hover"
          className="flex items-center gap-2.5"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[var(--omega-emerald)]/15 text-[var(--omega-emerald)]">
            <span className="font-display text-lg font-bold leading-none">Ω</span>
            <span className="absolute inset-0 rounded-full ring-1 ring-[var(--omega-emerald)]/40" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-[0.2em] text-[var(--omega-fg)]">
            OMEGA
          </span>
        </a>

        {/* Center links */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-cursor="hover"
              className="group relative rounded-full px-4 py-2 text-[13px] font-medium text-[var(--omega-fg-dim)] transition-colors hover:text-[var(--omega-fg)]"
            >
              {l.label}
              <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-[var(--omega-emerald)] to-[var(--omega-amber)] transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--omega-glass-border)] px-3 py-1.5 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--omega-emerald)] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--omega-emerald)]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--omega-fg-dim)]">
              online
            </span>
          </span>
          <OmegaButton size="sm" className="group">
            Launch
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </OmegaButton>
        </div>
      </div>

      {/* Scroll progress filament */}
      <div className="pointer-events-none absolute -bottom-1 left-1/2 h-px w-[min(620px,90%)] -translate-x-1/2 overflow-hidden rounded-full bg-[oklch(1_0_0_/_0.06)]">
        <motion.div
          style={{ width: filament }}
          className="h-full bg-gradient-to-r from-[var(--omega-emerald)] via-[var(--omega-amber)] to-[var(--omega-rose)]"
        />
      </div>
    </motion.header>
  );
}
