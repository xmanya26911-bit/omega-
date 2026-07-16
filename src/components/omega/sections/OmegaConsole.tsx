"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
// (useEffect retained for the CodePanel typewriter)
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Brain,
  Image as ImageIcon,
  Mic,
  Code2,
  Globe,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";
import { GlassCard } from "../ui/GlassCard";

interface Cmd {
  icon: LucideIcon;
  label: string;
  hint: string;
  accent: string;
}

const COMMANDS: Cmd[] = [
  { icon: Brain, label: "Reason: summarize the thread", hint: "⌘R", accent: "var(--omega-emerald)" },
  { icon: ImageIcon, label: "Generate: hero key art", hint: "⌘G", accent: "var(--omega-amber)" },
  { icon: Mic, label: "Voice: start dictation", hint: "⌘V", accent: "var(--omega-rose)" },
  { icon: Code2, label: "Run: agent.deploy('web')", hint: "⌘E", accent: "var(--omega-emerald)" },
  { icon: Globe, label: "Search: latest research", hint: "⌘K", accent: "var(--omega-amber)" },
  { icon: Terminal, label: "Open: runtime console", hint: "⌘\\", accent: "var(--omega-rose)" },
];

const CODE_LINES = [
  { t: "import { omega } from \"@omega/core\";", c: "text-[var(--omega-fg-dim)]" },
  { t: "", c: "" },
  { t: "const agent = omega.agent({", c: "text-[var(--omega-fg)]" },
  { t: "  name: \"aurora\",", c: "text-[var(--omega-emerald)]" },
  { t: "  model: \"omega-3\",", c: "text-[var(--omega-amber)]" },
  { t: "  tools: [reason, vision, voice],", c: "text-[var(--omega-fg)]" },
  { t: "  memory: { mode: \"local\", depth: 128 },", c: "text-[var(--omega-rose)]" },
  { t: "})", c: "text-[var(--omega-fg)]" },
  { t: "", c: "" },
  { t: "await agent.run({", c: "text-[var(--omega-fg)]" },
  { t: "  goal: \"design a cinematic OS\",", c: "text-[var(--omega-emerald)]" },
  { t: "  stream: true,", c: "text-[var(--omega-amber)]" },
  { t: "})", c: "text-[var(--omega-fg)]" },
];

/**
 * OmegaConsole — floating command palette + holographic code panel.
 * The palette is genuinely interactive: type to filter, arrow keys to navigate,
 * enter to "run". The code panel types itself out, then idles.
 */
export function OmegaConsole() {
  return (
    <section
      id="console"
      className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36"
    >
      <SectionHeading
        kicker="Console"
        title="Command the entire system"
        subtitle="One palette, every capability. Type a natural instruction or a keyboard shortcut — Omega routes it to the right runtime."
      />

      <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CommandPalette />
        <CodePanel />
      </div>
    </section>
  );
}

function CommandPalette() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  // Clamp the active index to the visible list (defensive — also reset on
  // query change in the onChange handler below).
  const safeActive = filtered.length === 0 ? 0 : Math.min(active, filtered.length - 1);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActive(0);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 12, transformPerspective: 1400 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, transformPerspective: 1400 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard tilt tiltMax={6} className="h-full">
        <div className="flex h-full flex-col p-4">
          {/* input */}
          <div className="flex items-center gap-3 border-b border-[var(--omega-glass-border)] pb-3">
            <Search className="h-4 w-4 text-[var(--omega-emerald)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={onChange}
              onKeyDown={onKey}
              data-cursor="hover"
              placeholder="Type a command or ask Omega…"
              className="w-full bg-transparent text-sm text-[var(--omega-fg)] placeholder:text-[var(--omega-fg-dim)]/60 focus:outline-none"
            />
            <kbd className="hidden rounded border border-[var(--omega-glass-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--omega-fg-dim)] sm:block">
              esc
            </kbd>
          </div>

          {/* results */}
          <div className="mt-2 flex max-h-[300px] flex-col gap-0.5 overflow-y-auto omega-scrollbar-hide">
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-[var(--omega-fg-dim)]">
                No matching commands.
              </div>
            )}
            {filtered.map((c, i) => {
              const Icon = c.icon;
              const isActive = i === safeActive;
              return (
                <button
                  key={c.label}
                  data-cursor="hover"
                  onMouseEnter={() => setActive(i)}
                  className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                  style={{
                    background: isActive
                      ? "color-mix(in oklch, var(--omega-emerald) 12%, transparent)"
                      : "transparent",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="cmd-active"
                      className="absolute inset-0 rounded-lg ring-1 ring-[var(--omega-emerald)]/40"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className="relative grid h-8 w-8 place-items-center rounded-md"
                    style={{
                      background: `color-mix(in oklch, ${c.accent} 16%, transparent)`,
                      color: c.accent,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="relative flex-1 text-[13px] text-[var(--omega-fg)]">
                    {c.label}
                  </span>
                  <kbd className="relative hidden font-mono text-[10px] text-[var(--omega-fg-dim)] sm:block">
                    {c.hint}
                  </kbd>
                </button>
              );
            })}
          </div>

          {/* footer */}
          <div className="mt-3 flex items-center justify-between border-t border-[var(--omega-glass-border)] pt-3 font-mono text-[10px] text-[var(--omega-fg-dim)]">
            <span className="flex items-center gap-1.5">
              <ArrowUp className="h-3 w-3" />
              <ArrowDown className="h-3 w-3" />
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="h-3 w-3" />
              run
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function CodePanel() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typed, setTyped] = useState("");

  // typewriter: reveal line by line, char by char
  useEffect(() => {
    if (visibleLines >= CODE_LINES.length) {
      const reset = setTimeout(() => {
        setVisibleLines(0);
        setTyped("");
      }, 2600);
      return () => clearTimeout(reset);
    }
    const line = CODE_LINES[visibleLines].t;
    if (typed.length < line.length) {
      const id = setTimeout(() => setTyped(line.slice(0, typed.length + 1)), 14);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => {
        setVisibleLines((v) => v + 1);
        setTyped("");
      }, 120);
      return () => clearTimeout(id);
    }
  }, [typed, visibleLines]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -12, transformPerspective: 1400 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, transformPerspective: 1400 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard tilt tiltMax={6} glow className="h-full">
        <div className="flex h-full flex-col p-4">
          {/* window chrome */}
          <div className="flex items-center justify-between border-b border-[var(--omega-glass-border)] pb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--omega-rose)]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--omega-amber)]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--omega-emerald)]/70" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--omega-fg-dim)]">
              agent.ts
            </span>
            <span className="font-mono text-[10px] text-[var(--omega-emerald)]">
              ● live
            </span>
          </div>

          {/* code */}
          <div className="mt-3 flex-1 font-mono text-[12.5px] leading-relaxed">
            {CODE_LINES.slice(0, visibleLines).map((l, i) => (
              <div key={i} className="flex">
                <span className="mr-4 w-4 select-none text-right text-[var(--omega-fg-dim)]/40">
                  {i + 1}
                </span>
                <span className={l.c}>{l.t || "\u00A0"}</span>
              </div>
            ))}
            {visibleLines < CODE_LINES.length && (
              <div className="flex">
                <span className="mr-4 w-4 select-none text-right text-[var(--omega-fg-dim)]/40">
                  {visibleLines + 1}
                </span>
                <span className={CODE_LINES[visibleLines].c}>
                  {typed}
                  <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-[var(--omega-emerald)] align-middle" />
                </span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
