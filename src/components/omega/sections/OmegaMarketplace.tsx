"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Bot,
  Database,
  Globe,
  Server,
  FileText,
  Image,
  Cloud,
  HardDrive,
  Lock,
  Search,
  Cpu,
  Code2,
  Terminal,
  Key,
  FileCode,
  Check,
  Mic,
  MessageSquare,
  Video,
  Puzzle,
  Camera,
  PenTool,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";
import { GlassCard } from "../ui/GlassCard";
import { cn } from "@/lib/utils";

interface Connector {
  icon: LucideIcon;
  name: string;
  desc: string;
  category: string;
  status: "ready" | "coming" | "beta";
  accent: string;
}

const ALL_CONNECTORS: Connector[] = [
  // ── AI Models (The Control Plane) ──
  { icon: Bot, name: "DeepSeek V4 Flash", desc: "128K context. Default reasoning engine. Multi-step planning + tool use.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "Nemotron 3 Ultra", desc: "Heavy-duty reasoning. Code, architecture, math — dominates benchmarks.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "Mimo 2.5", desc: "Lightning-fast responses. Optimized for latency-critical paths.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "North Mini Code", desc: "Code specialist. Generation, review, refactoring — built for devs.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "Hybrid-3 (Hy3)", desc: "Balanced generalist. Chat, analysis, creative — zero compromise.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Globe, name: "Custom OpenAI-Compatible", desc: "Plug in ANY endpoint. Your keys, your models, Omega's orchestration.", category: "models", status: "ready", accent: "#fbbf24" },
  { icon: Cpu, name: "OpenCode Zen Free", desc: "5 premium models via opencode.ai/zen/v1. Zero config. Zero cost.", category: "models", status: "ready", accent: "#818cf8" },

  // ── MCP Servers (Infrastructure Layer) ──
  { icon: HardDrive, name: "Filesystem MCP", desc: "Full FS access: read, write, search, watch, glob, patch. Sandboxed.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Database, name: "SQLite MCP", desc: "Query, migrate, index SQLite databases directly from chat.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Code2, name: "Git MCP", desc: "Clone, commit, push, branch, merge, log, diff — git as a tool.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Server, name: "Docker MCP", desc: "Container lifecycle: pull, run, exec, logs, compose. Full control.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Server, name: "Kubernetes MCP", desc: "Manage k8s: pods, deployments, services, namespaces, logs.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Database, name: "PostgreSQL MCP", desc: "Production Postgres: query, schema, explain, backup.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Globe, name: "Brave Search MCP", desc: "Real-time web search with citations. No hallucination.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Bot, name: "GitHub MCP", desc: "Repos, issues, PRs, code review, workflows — GitHub native.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: MessageSquare, name: "Linear MCP", desc: "Issues, sprints, projects, cycles — Linear workflow automation.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Search, name: "Sentry MCP", desc: "Errors, traces, metrics, releases — observability in chat.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Image, name: "Excalidraw MCP", desc: "Generate hand-drawn diagrams programmatically. Architecture as code.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Globe, name: "Web Fetch MCP", desc: "Extract clean markdown from any URL. PDFs, JS-heavy sites, auth.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Cpu, name: "Sequential Thinking", desc: "Structured reasoning traces. Dynamic thought management.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: FileText, name: "Memory MCP", desc: "Persistent knowledge graph: entities, relations, temporal queries.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Puzzle, name: "Everything MCP", desc: "Test server with every resource/tool type. Dev playground.", category: "mcp", status: "beta", accent: "#f43f5e" },
  { icon: Image, name: "Playwright MCP", desc: "Browser automation: navigate, click, type, screenshot, console.", category: "mcp", status: "beta", accent: "#f43f5e" },

  // ── Storage & Sync ──
  { icon: Cloud, name: "Google Drive", desc: "Auto-sync conversations. OAuth PKCE. Cross-device history.", category: "storage", status: "ready", accent: "#fbbf24" },
  { icon: Lock, name: "Encrypted Secrets Vault", desc: "AES-256. ~/.omega/.secrets.json. Multi-layer fallback.", category: "storage", status: "ready", accent: "#f43f5e" },
  { icon: Database, name: "Local Storage", desc: "Instant session persistence. Zero config. Browser native.", category: "storage", status: "ready", accent: "#fbbf24" },
  { icon: Cloud, name: "S3 / R2 Compatible", desc: "Any S3 API. Object storage for datasets, models, backups.", category: "storage", status: "beta", accent: "#fbbf24" },

  // ── Developer Tools (Built-In, Not Plugins) ──
  { icon: Code2, name: "Python REPL", desc: "Stateful Python. Auto-pip. Variables persist across calls.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Terminal, name: "Shell Terminal", desc: "Full git-bash. Build, deploy, ssh, docker — anything.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Search, name: "Web Search", desc: "DuckDuckGo + Wikipedia. Clean markdown extraction.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: FileText, name: "PDF Extraction", desc: "arXiv, docs, reports → clean markdown. Vision fallback.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Image, name: "Vision Analysis", desc: "Analyze screenshots, diagrams, images. Extract text/data.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Mic, name: "Speech Recognition", desc: "Browser SpeechRecognition. Voice input → text.", category: "tools", status: "ready", accent: "#818cf8" },
  { icon: FileText, name: "Text-to-Speech", desc: "Edge TTS + OpenAI TTS. Natural voices. Any response → speech.", category: "tools", status: "ready", accent: "#818cf8" },
  { icon: Camera, name: "Screen Capture", desc: "Full screen or window. Use as model context instantly.", category: "tools", status: "ready", accent: "#818cf8" },

  // ── Social & Communication ──
  { icon: MessageSquare, name: "Telegram Bot", desc: "Omega in Telegram. Commands, inline, threads, webhooks.", category: "social", status: "beta", accent: "#f43f5e" },
  { icon: MessageSquare, name: "Discord Bot", desc: "Slash commands, threads, ephemeral, autocomplete.", category: "social", status: "beta", accent: "#f43f5e" },
  { icon: MessageSquare, name: "WhatsApp Business", desc: "Official Business API. Templates, media, flows.", category: "social", status: "coming", accent: "#f43f5e" },
  { icon: Globe, name: "Webhooks", desc: "Trigger workflows via HTTP. Signatures, retries, DLQ.", category: "social", status: "beta", accent: "#f43f5e" },

  // ── Media & Content ──
  { icon: Image, name: "Pollinations AI", desc: "Free image generation. Prompt → image in chat. No key.", category: "media", status: "ready", accent: "#f43f5e" },
  { icon: Video, name: "YouTube Transcripts", desc: "Extract, summarize, search any YouTube video.", category: "media", status: "ready", accent: "#f43f5e" },
  { icon: FileText, name: "Music Generation", desc: "Suno API. Lyrics + tags → full song. Audio in chat.", category: "media", status: "beta", accent: "#f43f5e" },

  // ── Deployment Targets ──
  { icon: Globe, name: "Vercel", desc: "Edge + Serverless. Zero-config. Preview every push.", category: "deploy", status: "ready", accent: "#34d399" },
  { icon: Server, name: "Render", desc: "Backend services, cron jobs, static sites. render.yaml.", category: "deploy", status: "ready", accent: "#34d399" },
  { icon: Server, name: "Docker Compose", desc: "Multi-container locally or remote. One file deploys all.", category: "deploy", status: "ready", accent: "#34d399" },
  { icon: Globe, name: "Railway", desc: "Instant Node/Python/DB. Git push → live URL.", category: "deploy", status: "beta", accent: "#34d399" },

  // ── Omega Exclusive: System Control ──
  { icon: Cpu, name: "PC Remote Control", desc: "WebSocket relay (Render) + local agent. Full shell from web chat.", category: "system", status: "ready", accent: "#34d399" },
  { icon: HardDrive, name: "File Encryption", desc: "AES-256 encrypt/decrypt any file. Strong, simple.", category: "system", status: "ready", accent: "#fbbf24" },
  { icon: Lock, name: "Registry & Services", desc: "Windows Registry RW. Service mgmt. Task Scheduler.", category: "system", status: "ready", accent: "#f43f5e" },
  { icon: Globe, name: "Network Discovery", desc: "LAN scan, topology map, port discovery, service ID.", category: "system", status: "ready", accent: "#818cf8" },
  { icon: Shield, name: "Security Hardening", desc: "CSP, CORS, rate limit, input sanitize, secret scan.", category: "system", status: "ready", accent: "#34d399" },
];

const CATEGORIES = [
  { id: "all", label: "All", count: ALL_CONNECTORS.length },
  { id: "models", label: "AI Models", count: ALL_CONNECTORS.filter((c) => c.category === "models").length },
  { id: "mcp", label: "MCP Servers", count: ALL_CONNECTORS.filter((c) => c.category === "mcp").length },
  { id: "storage", label: "Storage", count: ALL_CONNECTORS.filter((c) => c.category === "storage").length },
  { id: "tools", label: "Dev Tools", count: ALL_CONNECTORS.filter((c) => c.category === "tools").length },
  { id: "social", label: "Social", count: ALL_CONNECTORS.filter((c) => c.category === "social").length },
  { id: "media", label: "Media", count: ALL_CONNECTORS.filter((c) => c.category === "media").length },
  { id: "deploy", label: "Deploy", count: ALL_CONNECTORS.filter((c) => c.category === "deploy").length },
  { id: "system", label: "System", count: ALL_CONNECTORS.filter((c) => c.category === "system").length },
];

const STATUS_COLORS: Record<string, string> = {
  ready: "var(--omega-emerald)",
  beta: "var(--omega-amber)",
  coming: "var(--omega-muted)",
};

export function OmegaMarketplace() {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = ALL_CONNECTORS.filter((c) => {
    if (activeCat !== "all" && c.category !== activeCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.category.includes(q)
      );
    }
    return true;
  });

  return (
    <section
      id="marketplace"
      className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36"
    >
      <SectionHeading
        kicker={`${ALL_CONNECTORS.length} Connectors`}
        title="Plugin & Connector Marketplace"
        subtitle="Extend Omega with MCP servers, AI models, storage backends, dev tools, and deployment targets — all pluggable."
      />

      {/* Search + filter bar */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-300",
                  active
                    ? "bg-[var(--omega-emerald)]/15 text-[var(--omega-emerald)] ring-1 ring-[var(--omega-emerald)]/40"
                    : "text-[var(--omega-fg-dim)] hover:bg-[var(--omega-bg-2)] hover:text-[var(--omega-fg)]"
                )}
              >
                {cat.label}
                <span className="ml-1 font-mono text-[9px] opacity-60">{cat.count}</span>
              </button>
            );
          })}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search connectors..."
          aria-label="Search connectors"
          className="omega-glass-thin rounded-xl px-3 py-2 text-xs text-[var(--omega-fg)] placeholder:text-[var(--omega-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--omega-ring)] sm:w-56"
        />
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filtered.map((conn, i) => (
          <ConnectorCard key={conn.name + conn.category} conn={conn} index={i} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center text-sm text-[var(--omega-muted)]">
          No connectors match your search. Try a different filter.
        </div>
      )}
    </section>
  );
}

function ConnectorCard({ conn, index }: { conn: Connector; index: number }) {
  const Icon = conn.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index % 8) * 0.04 }}
    >
      <GlassCard tilt={false} className="h-full">
        <div className="flex h-full flex-col gap-3 p-4">
          {/* Top row: icon + status badge */}
          <div className="flex items-start justify-between">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-lg"
              style={{
                background: `color-mix(in oklch, ${conn.accent} 14%, transparent)`,
                color: conn.accent,
              }}
            >
              <Icon className="size-4" />
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] font-semibold"
              style={{
                background: `color-mix(in oklch, ${conn.accent} 12%, transparent)`,
                color: conn.accent,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: STATUS_COLORS[conn.status] }}
              />
              {conn.status === "coming" ? "Coming" : conn.status === "beta" ? "Beta" : "Ready"}
            </span>
          </div>

          {/* Name + desc */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-[var(--omega-fg)]">
              {conn.name}
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--omega-fg-dim)]">
              {conn.desc}
            </p>
          </div>

          {/* Category tag */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[var(--omega-bg-2)] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--omega-fg-dim)]">
              {conn.category}
            </span>
            <button
              type="button"
              data-cursor="hover"
              disabled={conn.status === "coming"}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all duration-200",
                conn.status === "ready" || conn.status === "beta"
                  ? "bg-[var(--omega-emerald)]/10 text-[var(--omega-emerald)] hover:bg-[var(--omega-emerald)]/20"
                  : "cursor-not-allowed bg-[var(--omega-bg-2)] text-[var(--omega-muted)]"
              )}
            >
              <Puzzle className="size-3" strokeWidth={2} />
              {conn.status === "coming" ? "Soon" : "Connect"}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
