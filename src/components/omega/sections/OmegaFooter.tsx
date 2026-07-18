"use client";

import { motion } from "framer-motion";
import { ArrowUp, Github, Twitter, Linkedin } from "lucide-react";
import { useLenisScroll, useMagnetic } from "../hooks/use-omega";

type FooterLink = { label: string; href: string; external?: boolean };

const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: "System",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Capabilities", href: "#capabilities" },
      { label: "Neural Core", href: "#neural" },
      { label: "Console", href: "#console" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "https://github.com/xmanya26911-bit/omega-", external: true },
      { label: "Runtime API", href: "https://omega-chat-five.vercel.app", external: true },
      { label: "Agents SDK", href: "https://github.com/xmanya26911-bit/omega-chat", external: true },
      { label: "Changelog", href: "https://github.com/xmanya26911-bit/omega-/commits/main", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#overview" },
      { label: "Pricing", href: "#pricing" },
      { label: "Marketplace", href: "#marketplace" },
      { label: "Contact", href: "https://omega-chat-five.vercel.app", external: true },
    ],
  },
];

const SOCIALS = [
  { icon: Github, href: "https://github.com/xmanya26911-bit/omega-", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://www.linkedin.com", label: "LinkedIn" },
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
              THE OMEGA AI operating system. Engineered for depth, motion, and craft —
              a living digital environment.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="grid h-9 w-9 place-items-center rounded-full border border-[var(--omega-glass-border)] text-[var(--omega-fg-dim)] transition-colors hover:border-[var(--omega-emerald)]/50 hover:text-[var(--omega-emerald)]"
                    aria-label={s.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--omega-fg-dim)]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => {
                  const isExternal = l.href.startsWith("http");
                  return (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(isExternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        data-cursor="hover"
                        className="group inline-flex items-center text-sm text-[var(--omega-fg)]/80 transition-colors hover:text-[var(--omega-emerald)]"
                      >
                        <span className="mr-0 h-px w-0 bg-[var(--omega-emerald)] transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                        {l.label}
                      </a>
                    </li>
                  );
                })}
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
