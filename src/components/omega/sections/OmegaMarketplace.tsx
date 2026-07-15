"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Plug,
  Database,
  Globe,
  GitBranch,
  Server,
  Bot,
  FileText,
  MessageSquare,
  Image,
  Music,
  Video,
  Cloud,
  HardDrive,
  Lock,
  Search,
  Puzzle,
  Cpu,
  Code2,
  Terminal,
  Brain,
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
  docs?: string;
}

const ALL_CONNECTORS: Connector[] = [
  // ── AI Models ──
  { icon: Bot, name: "DeepSeek V4 Flash", desc: "High-speed reasoning with 128K context. Default free model.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "Mimo 2.5", desc: "Lightweight model optimized for rapid response.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "Nemotron 3 Ultra", desc: "Heavy-duty reasoning with enhanced accuracy.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "North Mini Code", desc: "Code-specialist model for generation & review.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Bot, name: "Hybrid-3 (Hy3)", desc: "Balanced general-purpose model.", category: "models", status: "ready", accent: "#34d399" },
  { icon: Globe, name: "OpenAI-Compatible", desc: "Connect any OpenAI-compatible API as a custom provider.", category: "models", status: "ready", accent: "#fbbf24" },

  // ── MCP Servers ──
  { icon: Cpu, name: "Time & Date", desc: "Real-time clock, timezone conversion, date arithmetic via MCP.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Globe, name: "Web Fetch", desc: "Fetch and extract content from any URL. Supports markdown, PDF, JSON.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Brain, name: "Sequential Thinking", desc: "Chain-of-thought reasoning with dynamic thought management.", category: "mcp", status: "ready", accent: "#818cf8" },

  // { icon: HardDrive, name: "Filesystem", desc: "Full file system access: read, write, search, watch, edit.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Database, name: "SQLite", desc: "Query and manage SQLite databases directly from chat.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: GitBranch, name: "Git", desc: "Full git operations: clone, commit, push, branch, log, diff.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Puzzle, name: "Everything", desc: "Test MCP server with every resource/tool type for development.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Image, name: "Playwright", desc: "Browser automation: navigate, click, type, screenshot, console.", category: "mcp", status: "beta", accent: "#f43f5e" },
  { icon: Globe, name: "Brave Search", desc: "Web and local search via Brave Search API.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Bot, name: "GitHub", desc: "Repository management, issues, PRs, code review via GitHub API.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Database, name: "PostgreSQL", desc: "Query PostgreSQL databases, schema inspection, data exploration.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Server, name: "Docker", desc: "Container lifecycle: pull, run, stop, exec, logs, compose.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Server, name: "Kubernetes", desc: "Manage k8s clusters: pods, deployments, services, namespaces.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: MessageSquare, name: "Linear", desc: "Issue tracking, project management, sprint planning via Linear API.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Search, name: "Sentry", desc: "Error tracking, performance monitoring, issue triage.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Image, name: "Excalidraw", desc: "Create hand-drawn style diagrams and wireframes.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: FileText, name: "Memory", desc: "Persistent knowledge store — facts, notes, user preferences.", category: "mcp", status: "ready", accent: "#818cf8" },

  // ── Storage & Sync ──
  { icon: Cloud, name: "Google Drive", desc: "Backup and sync conversations. OAuth 2.0 secured.", category: "storage", status: "ready", accent: "#fbbf24" },
  { icon: Database, name: "Local Storage", desc: "Automatic session persistence in browser localStorage.", category: "storage", status: "ready", accent: "#fbbf24" },
  { icon: Cloud, name: "S3 / R2", desc: "Connect any S3-compatible object storage. (Coming soon)", category: "storage", status: "coming", accent: "#fbbf24" },
  { icon: Lock, name: "Encrypted Secrets", desc: "AES-256 encrypted credential storage via ~/.omega/secrets.", category: "storage", status: "ready", accent: "#f43f5e" },

  // ── Developer Tools ──
  { icon: Code2, name: "Python REPL", desc: "Persistent Python execution environment with auto-pip-install.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Terminal, name: "Shell Terminal", desc: "Full shell access via git-bash. Run scripts, build, deploy.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Search, name: "Web Search", desc: "DuckDuckGo + Wikipedia search integration.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: FileText, name: "PDF Extraction", desc: "Extract text from PDF files including arXiv papers.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Image, name: "Vision Analysis", desc: "Analyze images, screenshots, diagrams with vision models.", category: "tools", status: "ready", accent: "#34d399" },
  { icon: Mic, name: "Speech Recognition", desc: "Browser SpeechRecognition API for voice input.", category: "tools", status: "ready", accent: "#818cf8" },
  { icon: Music, name: "Text-to-Speech", desc: "Neural TTS via Edge and OpenAI. Convert any response to speech.", category: "tools", status: "ready", accent: "#818cf8" },
  { icon: Camera, name: "Screen Capture", desc: "Capture full screen or window for context.", category: "tools", status: "ready", accent: "#818cf8" },

  // ── Social & Communication ──
  { icon: MessageSquare, name: "Telegram Bot", desc: "Chat with Omega via Telegram. Pull-based message delivery.", category: "social", status: "coming", accent: "#f43f5e" },
  { icon: MessageSquare, name: "Discord Bot", desc: "Omega in your Discord server. Slash commands + threads.", category: "social", status: "coming", accent: "#f43f5e" },
  { icon: MessageSquare, name: "WhatsApp", desc: "Send and receive messages via WhatsApp Business API.", category: "social", status: "coming", accent: "#f43f5e" },
  { icon: Globe, name: "Webhooks", desc: "Trigger Omega workflows via HTTP webhooks. (Coming soon)", category: "social", status: "coming", accent: "#f43f5e" },

  // ── Media & Content ──
  { icon: Image, name: "Pollinations AI", desc: "Free AI image generation from text prompts.", category: "media", status: "ready", accent: "#f43f5e" },
  { icon: Video, name: "YouTube Transcripts", desc: "Extract and summarize YouTube video transcripts.", category: "media", status: "ready", accent: "#f43f5e" },
  { icon: Music, name: "Music Generation", desc: "Generate songs and audio from lyrics + tags via Suno.", category: "media", status: "coming", accent: "#f43f5e" },

  // ── Deployment ──
  { icon: Globe, name: "Vercel", desc: "One-command deployment of web apps to Vercel Edge/Serverless.", category: "deploy", status: "ready", accent: "#34d399" },
  { icon: Server, name: "Render", desc: "Deploy backend services with zero-config render.yaml.", category: "deploy", status: "ready", accent: "#34d399" },
  { icon: Server, name: "Docker Compose", desc: "Deploy multi-container applications locally or on any host.", category: "deploy", status: "ready", accent: "#34d399" },
  { icon: Cloud, name: "Railway", desc: "Quick-deploy Node.js and Python services. (Coming soon)", category: "deploy", status: "coming", accent: "#34d399" },
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
              <Plug className="size-3" strokeWidth={2} />
              {conn.status === "coming" ? "Soon" : "Connect"}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
