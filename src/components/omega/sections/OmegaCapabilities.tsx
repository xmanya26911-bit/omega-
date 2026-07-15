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
  { icon: Sparkles, title: "5 Free Models", body: "Every model is free to use. No credits, no tokens, no paywall. Just install and run.", category: "core", accent: "#34d399" },
  { icon: Layers, title: "Long-Term Memory", body: "Persistent context across sessions. Omega remembers your preferences, project state, and decisions — forever.", category: "core", accent: "#fbbf24" },
  { icon: Code, title: "Code Execution", body: "Python REPL, shell scripts, Node.js — run code inline with full stdlib access. Auto-installs missing packages.", category: "core", accent: "#fbbf24" },

  // ── TUI / CLI ──
  { icon: Terminal, title: "Rich Terminal TUI", body: "Full-screen prompt_toolkit interface with ASCII art welcome, real-time system dashboard, and streaming response output.", category: "tui", accent: "#34d399" },
  { icon: Palette, title: "11 Custom Themes", body: "Cyber, Iron Man, Matrix, Midnight, Plasma, Draco, Nova, Storm, Amber, Frost, Ember — full color palette per theme.", category: "tui", accent: "#f43f5e" },
  { icon: Layers, title: "Premium Input Bar", body: "FuzzyWordCompleter, Alt+Enter multi-line input, bottom toolbar with model/token/status info, clipboard integration.", category: "tui", accent: "#fbbf24" },
  { icon: MessageSquare, title: "15 Slash Commands", body: "/model, /clear, /theme, /export, /memory, /tools, /help, /status, /tokens, /diagnostics, /agents, /provider, /keys, /session, /save", category: "tui", accent: "#34d399" },
  { icon: Brain, title: "Thinking Display", body: "Visible chain-of-thought streamed in real-time with styled prefix. Watch Omega reason step-by-step.", category: "tui", accent: "#818cf8" },

  // ── Multi-Agent System ──
  { icon: Workflow, title: "ADK Multi-Agent System", body: "6-agent graph-based workflow: Orchestrator leads, 5 specialists handle UI, backend, code, review, and user interaction.", category: "agents", accent: "#34d399" },
  { icon: Puzzle, title: "Agent-to-Agent Delegation", body: "Built on Google ADK 2.0. Orchestrator transfers tasks to specialists via structured delegation — results flow back automatically.", category: "agents", accent: "#fbbf24" },
  { icon: Shield, title: "Code Review Pipeline", body: "Verifier agent reviews every output before delivery. Security audit, style check, edge case analysis — automated.", category: "agents", accent: "#f43f5e" },
  { icon: Layers, title: "OpenCode LLM Connector", body: "Custom BaseLlm implementation lets ADK agents use any OpenAI-compatible model provider — including your own.", category: "agents", accent: "#818cf8" },

  // ── Provider / API Keys ──
  { icon: Key, title: "API Key Management", body: "Generate, validate, revoke API keys programmatically. `omg_` prefixed keys with per-key rate limiting and usage tracking.", category: "provider", accent: "#34d399" },
  { icon: Globe, title: "OpenAI-Compatible API", body: "Drop-in replacement for any OpenAI SDK. Set base_url to your OmegaCLI provider and all your tools work unchanged.", category: "provider", accent: "#fbbf24" },
  { icon: Server, title: "FastAPI Server", body: "`python -m omega.provider.server` starts a production REST API with CORS, rate limiting, and full model list endpoint.", category: "provider", accent: "#f43f5e" },
  { icon: Cpu, title: "Rate Limiter", body: "Sliding-window per-key rate limiter — 60 req/min default. Configurable window and burst limits.", category: "provider", accent: "#818cf8" },

  // ── Tools ──
  { icon: FileCode, title: "File Operations", body: "Read, write, patch, search across files. Glob-aware, ripgrep-backed content search. Auto-lints Python/TS/JSON on write.", category: "tools", accent: "#34d399" },
  { icon: Search, title: "Web Search & Extract", body: "Search the web via DuckDuckGo, Wikipedia, or custom backends. Extract clean markdown from any URL — including PDFs.", category: "tools", accent: "#fbbf24" },
  { icon: GitBranch, title: "Git Integration", body: "Full git CLI pass-through. Clone, commit, push, branch, merge — all from within Omega. Deploy to Vercel with one command.", category: "tools", accent: "#f43f5e" },
  { icon: Database, title: "SQLite Databases", body: "Full SQL support with persistent connections. Create, query, join, index — run SQL against local databases interactively.", category: "tools", accent: "#818cf8" },
  { icon: Terminal, title: "Process Management", body: "Spawn background processes, poll output, wait on completion, kill, write to stdin. Server lifecycle management.", category: "tools", accent: "#34d399" },
  { icon: Code, title: "Python REPL", body: "Persistent stateful Python environment for complex computation. Auto-pip-install any library needed.", category: "tools", accent: "#fbbf24" },

  // ── Media / Input ──
  { icon: Image, title: "Image Understanding", body: "Vision-language analysis of images, screenshots, diagrams. Extract text, describe content, answer questions about visuals.", category: "media", accent: "#34d399" },
  { icon: Camera, title: "Screen Capture", body: "Capture the entire screen or a window. Analyze content, extract data, or use as context for the model.", category: "media", accent: "#fbbf24" },
  { icon: Mic, title: "Speech Recognition", body: "Browser SpeechRecognition API converts voice to text. Record from microphone and get transcription.", category: "media", accent: "#f43f5e" },
  { icon: Volume2, title: "Text-to-Speech", body: "Neural TTS via multiple providers (Edge, OpenAI). Convert any response to natural-sounding speech.", category: "media", accent: "#818cf8" },
  { icon: FileText, title: "PDF Extraction", body: "Read text from any PDF. arXiv papers, documents, reports — extract clean markdown content.", category: "media", accent: "#34d399" },

  // ── System ──
  { icon: Cpu, title: "System Monitoring", body: "Real-time CPU/RAM/disk usage dashboard. Background health watcher with configurable threshold alerts.", category: "system", accent: "#34d399" },
  { icon: HardDrive, title: "File Encryption", body: "AES-256 encrypt/decrypt any file. Secure your sensitive data with strong encryption, directly from Omega.", category: "system", accent: "#fbbf24" },
  { icon: Lock, title: "Registry & Services", body: "Full Windows Registry read/write/delete. Service management (list/start/stop/restart), Task Scheduler integration.", category: "system", accent: "#f43f5e" },
  { icon: Globe, title: "Network Discovery", body: "Scan LAN for active devices. Map network topology, discover open ports, identify services.", category: "system", accent: "#818cf8" },
  { icon: Cloud, title: "Docker Containers", body: "Full container lifecycle — pull, create, start, stop, exec, logs. Manage containers from within Omega.", category: "system", accent: "#34d399" },

  // ── Cloud Features ──
  { icon: MessageSquare, title: "Chat Interface", body: "Streaming chat with full markdown rendering, syntax-highlighted code blocks, and real-time thinking display.", category: "cloud", accent: "#34d399" },
  { icon: Cloud, title: "Google Drive Sync", body: "Auto-save conversations to Drive with 2-second debounce. Load history across devices. OAuth-secured.", category: "cloud", accent: "#fbbf24" },
  { icon: Globe, title: "Google OAuth", body: "PKCE-based Google sign-in. Secure redirect flow, no popups. Full session restoration on return.", category: "cloud", accent: "#f43f5e" },
  { icon: Image, title: "Image Generation", body: "Pollinations.ai integration for free AI image generation. Describe what you want, get a generated image.", category: "cloud", accent: "#818cf8" },
  { icon: Download, title: "CLI Download", body: "One-click CLI installer from the website header. Git clone + pip install — running in under a minute.", category: "cloud", accent: "#34d399" },

  // ── Privacy & Security ──
  { icon: Shield, title: "Local-First Architecture", body: "All processing happens on your machine. Your data never leaves without your permission. No telemetry, no tracking.", category: "security", accent: "#34d399" },
  { icon: Lock, title: "Encrypted Secrets", body: "API keys stored encrypted in ~/.omega/.secrets.json. Auto-validated at load. Multi-layer fallback system.", category: "security", accent: "#fbbf24" },
  { icon: Key, title: "Granular Permissions", body: "Permission levels per tool: ALWAYS, CONFIRM, RESTRICTED, NEVER, SANDBOXED. You control what Omega can do.", category: "security", accent: "#f43f5e" },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "core", label: "Core AI", icon: Brain },
  { id: "tui", label: "Terminal UI", icon: Terminal },
  { id: "agents", label: "Multi-Agent", icon: Workflow },
  { id: "provider", label: "Provider", icon: Key },
  { id: "tools", label: "Developer Tools", icon: Code },
  { id: "media", label: "Media & IO", icon: Mic },
  { id: "system", label: "System", icon: Cpu },
  { id: "cloud", label: "Cloud", icon: Cloud },
  { id: "security", label: "Security", icon: Shield },
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
