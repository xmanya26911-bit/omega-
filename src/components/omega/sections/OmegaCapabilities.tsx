"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import {
  Brain, Terminal, Palette, Workflow, Shield, Cpu, Database,
  Key, Globe, FileCode, FileText, Image, Mic, Volume2, Camera,
  Search, GitBranch, Code, Server, Layers, Puzzle, Lock,
  HardDrive, Cloud, Download, MessageSquare, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";
import { GlassCard } from "../ui/GlassCard";

interface Cap {
  icon: LucideIcon;
  title: string;
  body: string;
  category: string;
  accent: string;
}

const ALL_CAPS: Cap[] = [
  // ── Core AI ──
  { icon: Brain, title: "Reasoning Engine", body: "Multi-step planning, tool orchestration, and self-critique. Omega thinks in structured traces — visible, auditable, fast.", category: "core", accent: "#34d399" },
  { icon: MessageSquare, title: "Multi-Provider LLMs", body: "DeepSeek V4 Flash, Mimo 2.5, Nemotron 3 Ultra, North Mini Code, Hy3 — plus custom provider support for any OpenAI-compatible API.", category: "core", accent: "#34d399" },
  { icon: Code, title: "Code Execution", body: "Python REPL, shell scripts, Node.js — run code inline with full stdlib access. Auto-installs missing packages.", category: "core", accent: "#fbbf24" },

  // ── Multi-Agent System ──
  { icon: Workflow, title: "ADK Multi-Agent System", body: "6-agent graph-based workflow: Orchestrator leads, 5 specialists handle UI, backend, code, review, and user interaction.", category: "agents", accent: "#34d399" },

  // ── Tools ──
  { icon: FileCode, title: "File Operations", body: "Read, write, patch, search across files. Glob-aware, ripgrep-backed content search. Auto-lints Python/TS/JSON on write.", category: "tools", accent: "#34d399" },

  // ── Cloud Features ──
  { icon: MessageSquare, title: "Chat Interface", body: "Streaming chat with full markdown rendering, syntax-highlighted code blocks, and real-time thinking display.", category: "cloud", accent: "#34d399" },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "core", label: "Core AI", icon: Brain },
  { id: "agents", label: "Multi-Agent", icon: Workflow },
  { id: "tools", label: "Developer Tools", icon: Code },
  { id: "cloud", label: "Cloud", icon: Cloud },
];

/**
 * OmegaCapabilities — displays EVERY feature Omega has, organized by category.
 * Includes a filter bar to focus on specific areas.
 */
export function OmegaCapabilities() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeCat, setActiveCat] = useState("all");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const layerY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const filtered = activeCat === "all"
    ? ALL_CAPS
    : ALL_CAPS.filter((c) => c.category === activeCat);

  return (
    <section
      id="capabilities"
      ref={ref}
      className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36"
    >
      <SectionHeading
        kicker={`${ALL_CAPS.length} Features`}
        title="Everything Omega can do"
        subtitle="Core AI engine, terminal TUI, multi-agent workflow, custom provider, developer tools — one runtime, every capability."
      />

      {/* Filter bar */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all duration-300 ${
                active
                  ? "bg-[var(--omega-emerald)]/15 text-[var(--omega-emerald)] ring-1 ring-[var(--omega-emerald)]/40"
                  : "text-[var(--omega-fg-dim)] hover:bg-[var(--omega-bg-2)] hover:text-[var(--omega-fg)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
              {cat.id === "all" && <span className="ml-0.5 opacity-50">({ALL_CAPS.length})</span>}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <motion.div
        style={{ y: layerY, perspective: 1400 }}
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((cap, i) => (
          <AssembleCard key={cap.title} cap={cap} index={i} />
        ))}
      </motion.div>

      {/* Feature count banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mt-16 max-w-2xl text-center"
      >
        <div className="omega-glass-thin inline-flex items-center gap-3 rounded-full px-5 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--omega-emerald)] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--omega-emerald)]" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--omega-fg-dim)]">
            {ALL_CAPS.length} features across {CATEGORIES.length - 1} domains
          </span>
        </div>
      </motion.div>
    </section>
  );
}

function AssembleCard({ cap, index }: { cap: Cap; index: number }) {
  const Icon = cap.icon;
  const enterRot = index % 2 === 0 ? -6 : 6;
  const enterX = index % 3 === 0 ? -30 : index % 3 === 1 ? 30 : 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        rotateX: 14,
        rotateY: enterRot,
        x: enterX,
        transformPerspective: 1200,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        x: 0,
        transition: {
          duration: 0.7,
          delay: (index % 4) * 0.08,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      viewport={{ once: true, margin: "-8% 0px" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <GlassCard tilt tiltMax={7} depth={30} className="h-full">
        <div className="flex h-full flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{
                background: `color-mix(in oklch, ${cap.accent} 14%, transparent)`,
                color: cap.accent,
                boxShadow: `0 0 20px -6px ${cap.accent}`,
              }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-[var(--omega-bg-2)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--omega-fg-dim)]">
              {cap.category}
            </span>
          </div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-[var(--omega-fg)]">
            {cap.title}
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--omega-fg-dim)]">
            {cap.body}
          </p>
          <div className="mt-auto pt-4">
            <div
              className="h-px w-3/5"
              style={{
                background: `linear-gradient(90deg, ${cap.accent}, transparent)`,
                opacity: 0.35,
              }}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
