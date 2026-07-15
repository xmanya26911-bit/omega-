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
  { icon: Brain, title: "Supreme Orchestrator", body: "Omega doesn't chat — it commands. Every request decomposes into parallel specialist agents. You get the synthesis, not the conversation.", category: "core", accent: "#34d399" },
  { icon: MessageSquare, title: "Multi-Provider LLM Control Plane", body: "DeepSeek V4 Flash, Mimo 2.5, Nemotron 3 Ultra, North Mini Code, Hy3 — plus any OpenAI-compatible endpoint. You pick the model per task. Omega optimizes cost/latency/quality.", category: "core", accent: "#34d399" },
  { icon: Sparkles, title: "Zero-Cost Free Models", body: "Every model free. No API keys. No rate limits. No credits. Just power.", category: "core", accent: "#34d399" },
  { icon: Layers, title: "Persistent Knowledge Graph", body: "Entities, relationships, temporal queries across all sessions. Omega builds a living map of your work — preferences, decisions, failures, patterns.", category: "core", accent: "#fbbf24" },
  { icon: Code, title: "Code Execution Sandbox", body: "Python/Node/Shell with full stdlib. Auto-installs packages. Real-time output streaming. Verified results, not guesses.", category: "core", accent: "#fbbf24" },
  { icon: Search, title: "Deep Research Engine", body: "Multi-source web search, recursive extraction, contradiction detection, citation tracking. Reports with verified claims only.", category: "core", accent: "#818cf8" },

  // ── TUI / CLI ──
  { icon: Terminal, title: "Rich Terminal TUI", body: "Full-screen prompt_toolkit with ASCII art welcome, real-time system dashboard, streaming response output, thinking display.", category: "tui", accent: "#34d399" },
  { icon: Palette, title: "11 Custom Themes", body: "Cyber, Iron Man, Matrix, Midnight, Plasma, Draco, Nova, Storm, Amber, Frost, Ember — complete color palettes per theme.", category: "tui", accent: "#f43f5e" },
  { icon: Layers, title: "Premium Input Bar", body: "FuzzyWordCompleter, Alt+Enter multi-line, bottom toolbar with model/token/status, clipboard integration, paste-as-image.", category: "tui", accent: "#fbbf24" },
  { icon: MessageSquare, title: "15 Slash Commands", body: "/model, /clear, /theme, /export, /memory, /tools, /help, /status, /tokens, /diagnostics, /agents, /provider, /keys, /session, /save", category: "tui", accent: "#34d399" },
  { icon: Brain, title: "Visible Reasoning Stream", body: "Chain-of-thought streamed in real-time with styled prefix. Watch Omega think step-by-step before acting.", category: "tui", accent: "#818cf8" },

  // ── Multi-Agent System ──
  { icon: Workflow, title: "ADK 2.0 Multi-Agent Orchestration", body: "6-agent graph workflow: Orchestrator leads 5 specialists (UI, Backend, Code, Review, User). Parallel execution, automatic synthesis.", category: "agents", accent: "#34d399" },
  { icon: Puzzle, title: "Agent-to-Agent Delegation", body: "Built on Google ADK 2.0. Orchestrator transfers tasks via structured delegation. Results flow back automatically.", category: "agents", accent: "#fbbf24" },
  { icon: Shield, title: "Automated Code Review Pipeline", body: "Verifier agent reviews every output before delivery. Security audit, style check, edge case analysis, type safety — zero human overhead.", category: "agents", accent: "#f43f5e" },
  { icon: Layers, title: "Universal LLM Connector", body: "Custom BaseLlm implementation lets ADK agents use any OpenAI-compatible provider. Your models, your rules.", category: "agents", accent: "#818cf8" },
  { icon: Terminal, title: "Team Mode CLI", body: "`omega --team` launches full multi-agent system. Orchestrator + 5 specialists, one-shot or interactive.", category: "agents", accent: "#34d399" },
  { icon: Brain, title: "Specialist Agents", body: "UI Agent (React/Tailwind/TSX), Backend Agent (APIs/DB/Auth/Infra), Code Writer (implementation), Verifier (security/quality), User Interface (conversation UX).", category: "agents", accent: "#34d399" },

  // ── Provider / API ──
  { icon: Key, title: "Programmatic API Key Management", body: "Generate, validate, revoke keys programmatically. `omg_` prefixed with per-key rate limiting and usage tracking.", category: "provider", accent: "#34d399" },
  { icon: Globe, title: "OpenAI-Compatible REST API", body: "Drop-in replacement for any OpenAI SDK. Set base_url to Omega Provider — all your tools work unchanged.", category: "provider", accent: "#fbbf24" },
  { icon: Server, title: "FastAPI Production Server", body: "`python -m omega.provider.server` — REST API with CORS, rate limiting, full model list endpoint, streaming support.", category: "provider", accent: "#f43f5e" },
  { icon: Cpu, title: "Sliding-Window Rate Limiter", body: "60 req/min default per key. Configurable window and burst. Token-bucket algorithm with Redis-ready architecture.", category: "provider", accent: "#818cf8" },

  // ── Developer Tools ──
  { icon: FileCode, title: "File Operations Suite", body: "Read, write, patch, search across files. Glob-aware, ripgrep-backed content search. Auto-lints Python/TS/JSON on write.", category: "tools", accent: "#34d399" },
  { icon: Search, title: "Web Search & Extraction", body: "DuckDuckGo, Wikipedia, custom backends. Extract clean markdown from any URL — including PDFs. Deep research mode.", category: "tools", accent: "#fbbf24" },
  { icon: GitBranch, title: "Full Git Integration", body: "Clone, commit, push, branch, merge, PR, CI/CD — all from within Omega. Deploy to Vercel with one command.", category: "tools", accent: "#f43f5e" },
  { icon: Database, title: "SQLite/PostgreSQL Engine", body: "Full SQL with persistent connections. Create, query, join, index, migrate — run against local or remote DBs.", category: "tools", accent: "#818cf8" },
  { icon: Terminal, title: "Process Orchestration", body: "Spawn background processes, poll output, wait on completion, kill, stdin write. Full server lifecycle management.", category: "tools", accent: "#34d399" },
  { icon: Code, title: "Stateful Python REPL", body: "Persistent Python environment for complex computation. Auto-pip-install any library. Variables persist across calls.", category: "tools", accent: "#fbbf24" },
  { icon: FileText, title: "Document Processing", body: "PDF extraction (arXiv, docs, reports), OCR, markdown conversion, structured data extraction from any document.", category: "tools", accent: "#34d399" },

  // ── Media & IO ──
  { icon: Image, title: "Vision-Language Analysis", body: "Analyze images, screenshots, diagrams. Extract text, describe content, answer visual questions.", category: "media", accent: "#34d399" },
  { icon: Camera, title: "Screen Capture & Analysis", body: "Capture full screen or window. Analyze content, extract data, use as model context.", category: "media", accent: "#fbbf24" },
  { icon: Mic, title: "Speech-to-Text", body: "Browser SpeechRecognition API. Record from microphone, get transcription. Voice input for any task.", category: "media", accent: "#f43f5e" },
  { icon: Volume2, title: "Neural Text-to-Speech", body: "Edge TTS, OpenAI TTS. Convert any response to natural speech. Multiple voices, languages.", category: "media", accent: "#818cf8" },

  // ── System Control ──
  { icon: Cpu, title: "Real-Time System Monitor", body: "Live CPU/RAM/disk dashboard. Background health watcher with configurable threshold alerts.", category: "system", accent: "#34d399" },
  { icon: HardDrive, title: "AES-256 File Encryption", body: "Encrypt/decrypt any file. Strong encryption directly from Omega. Secure sensitive data.", category: "system", accent: "#fbbf24" },
  { icon: Lock, title: "Windows Registry & Services", body: "Full Registry read/write/delete. Service management (list/start/stop/restart). Task Scheduler integration.", category: "system", accent: "#f43f5e" },
  { icon: Globe, title: "Network Discovery & Mapping", body: "LAN scan, topology mapping, port discovery, service identification. Full network visibility.", category: "system", accent: "#818cf8" },
  { icon: Cloud, title: "Docker Container Control", body: "Pull, create, start, stop, exec, logs. Full container lifecycle from within Omega.", category: "system", accent: "#34d399" },
  { icon: Terminal, title: "PC Remote Control", body: "WebSocket relay (Render free tier) + local agent. Execute shell commands on your Windows PC from the website chat.", category: "system", accent: "#34d399" },

  // ── Cloud Features ──
  { icon: MessageSquare, title: "Supreme Chat Interface", body: "Streaming markdown, syntax-highlighted code blocks, thinking display, model selector, file upload, paste image, auto-save to Drive.", category: "cloud", accent: "#34d399" },
  { icon: Cloud, title: "Google Drive Auto-Sync", body: "2-second debounced auto-save. Cross-device history. AI-generated session titles. OAuth PKCE flow, no popups.", category: "cloud", accent: "#fbbf24" },
  { icon: Globe, title: "Google OAuth PKCE", body: "Secure redirect flow. Full session restoration. Clean URL after auth (no hash). Production-ready.", category: "cloud", accent: "#f43f5e" },
  { icon: Image, title: "AI Image Generation", body: "Pollinations.ai integration. Describe → generate → insert. Free, no API key.", category: "cloud", accent: "#818cf8" },
  { icon: Download, title: "One-Click CLI Installer", body: "Git clone + pip install — running in under 60 seconds. Desktop shortcuts auto-created.", category: "cloud", accent: "#34d399" },

  // ── Security & Privacy ──
  { icon: Shield, title: "Local-First Architecture", body: "All processing on your machine. Data never leaves without permission. Zero telemetry. Zero tracking.", category: "security", accent: "#34d399" },
  { icon: Lock, title: "Encrypted Secrets Vault", body: "API keys in ~/.omega/.secrets.json, encrypted. Auto-validated at load. Multi-layer fallback (env, file, defaults).", category: "security", accent: "#fbbf24" },
  { icon: Key, title: "Granular Permission System", body: "Per-tool permissions: ALWAYS, CONFIRM, RESTRICTED, NEVER, SANDBOXED. You control every capability.", category: "security", accent: "#f43f5e" },
  { icon: Shield, title: "Security Hardening", body: "CSP headers, CORS policy, rate limiting, input sanitization, prompt injection defense, secret scanning, audit logging.", category: "security", accent: "#34d399" },
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
