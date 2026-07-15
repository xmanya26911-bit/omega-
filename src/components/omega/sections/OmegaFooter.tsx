"use client";

import { motion } from "framer-motion";
import { ArrowUp, Github, Twitter, Linkedin } from "lucide-react";
import { useLenisScroll, useMagnetic } from "../hooks/use-omega";

const COLS = [
  {
    title: "System",
    links: ["Overview", "Capabilities", "Neural Core", "Console"],
  },
  {
    title: "Developers",
    links: ["Documentation", "Runtime API", "Agents SDK", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Research", "Careers", "Contact"],
  },
];

/**
 * OmegaFooter — sticky footer. Sits flush to the viewport bottom on short
 * content (via the page's `min-h-screen flex flex-col` + `mt-auto` wrapper) and
 * pushes down naturally on long content.
 */
export function OmegaFooter() {
  const scrollTo = useLenisScroll();
  const topRef = useMagnetic<HTMLButtonElement>(0.4, 80);

  return (
    <footer className="relative z-10 mt-auto border-t border-[var(--omega-glass-border)]">
      {/* top hairline glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--omega-emerald)]/50 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--omega-emerald)]/15 text-[var(--omega-emerald)]">
                <span className="font-display text-lg font-bold leading-none">Ω</span>
              </span>
              <span className="font-display text-base font-semibold tracking-[0.2em] text-[var(--omega-fg)]">
                OMEGA
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--omega-fg-dim)]">
              The AI operating system. Engineered for depth, motion, and craft —
              a living digital environment.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  data-cursor="hover"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[var(--omega-glass-border)] text-[var(--omega-fg-dim)] transition-colors hover:border-[var(--omega-emerald)]/50 hover:text-[var(--omega-emerald)]"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--omega-fg-dim)]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      data-cursor="hover"
                      className="group inline-flex items-center text-sm text-[var(--omega-fg)]/80 transition-colors hover:text-[var(--omega-emerald)]"
                    >
                      <span className="mr-0 h-px w-0 bg-[var(--omega-emerald)] transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--omega-glass-border)] pt-6 sm:flex-row">
          <p className="font-mono text-[11px] text-[var(--omega-fg-dim)]">
            © {new Date().getFullYear()} Omega Systems. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--omega-fg-dim)]">
              crafted for the web
            </span>
            <motion.button
              ref={topRef}
              onClick={() => scrollTo("#top")}
              data-cursor="hover"
              whileTap={{ scale: 0.9 }}
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--omega-glass-border)] text-[var(--omega-emerald)] transition-colors hover:border-[var(--omega-emerald)]/60"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
