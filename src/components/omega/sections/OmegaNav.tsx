"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMagnetic, useLenisScroll } from "../hooks/use-omega";
import { OmegaButton } from "../ui/OmegaButton";

const LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Neural", href: "#neural" },
  { label: "Console", href: "#console" },
  { label: "Pricing", href: "#pricing" },
  { label: "Plugins", href: "#marketplace" },
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
  const [isCliOpen, setIsCliOpen] = useState(false);

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
          <button
            onClick={() => setIsCliOpen(true)}
            className="omega-glass-thin flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-[var(--omega-fg)] transition-all hover:border-[var(--omega-emerald)]/50 hover:text-[var(--omega-emerald)] sm:px-3.5 sm:py-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            CLI
          </button>
        </div>

      {/* ── CLI Download Modal ──────────────────────────────────────── */}
      {isCliOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsCliOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="omega-glass w-full max-w-lg rounded-2xl p-6 sm:p-8"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--omega-fg)]">Omega CLI</h3>
                <p className="mt-1 text-[13px] text-[var(--omega-fg-dim)]">
                  The same AI engine, now in your terminal.
                </p>
              </div>
              <button
                onClick={() => setIsCliOpen(false)}
                className="grid size-8 place-items-center rounded-full border border-[var(--omega-glass-border)] text-[var(--omega-fg-dim)] transition-colors hover:text-[var(--omega-fg)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-5 space-y-2 text-[13px] leading-relaxed text-[var(--omega-fg-dim)]">
              <p>Omega CLI brings the full power of the Omega AI platform to your local terminal:</p>
              <ul className="space-y-1.5 pl-4">
                <li>• 150+ built-in tools — files, web, code, git, SQL, images</li>
                <li>• Long-term persistent memory across sessions</li>
                <li>• Rich TUI with themes, command history, and auto-complete</li>
                <li>• Multi-model support (DeepSeek, Mimo, Nemotron, and more)</li>
                <li>• Python REPL, background tasks, REST API client</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--omega-glass-border)] bg-[oklch(0_0_0_/_0.3)] p-3 font-mono text-[12px]">
                <div className="text-[var(--omega-fg-dim)]"># Clone & run</div>
                <div className="mt-1 text-[var(--omega-emerald)]">
                  git clone https://github.com/xmanya26911-bit/omegacli.git<br />
                  <span className="text-[var(--omega-fg)]">cd omegacli && pip install -r requirements.txt</span><br />
                  <span className="text-[var(--omega-amber)]">python main.py</span>
                </div>
              </div>

              <a
                href="https://github.com/xmanya26911-bit/omegacli"
                target="_blank"
                rel="noopener noreferrer"
                className="omega-button flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      )}

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
