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
  // ── AI Models ──
  { icon: Bot, name: "DeepSeek V4 Flash", desc: "High-speed reasoning with 128K context. Default free model.", category: "models", status: "ready", accent: "#34d399" },

  // ── MCP Servers ──
  { icon: Bot, name: "GitHub", desc: "Repository management, issues, PRs, code review via GitHub API.", category: "mcp", status: "ready", accent: "#818cf8" },
  { icon: Server, name: "Docker", desc: "Container lifecycle: pull, run, stop, exec, logs, compose.", category: "mcp", status: "ready", accent: "#818cf8" },

  // ── Storage & Sync ──
  { icon: Cloud, name: "Google Drive", desc: "Backup and sync conversations. OAuth 2.0 secured.", category: "storage", status: "ready", accent: "#fbbf24" },

  // ── Dev Tools ──
  { icon: Search, name: "Web Search", desc: "DuckDuckGo + Wikipedia search integration.", category: "tools", status: "ready", accent: "#34d399" },

  // ── Deployment ──
  { icon: Globe, name: "Vercel", desc: "One-command deployment of web apps to Vercel Edge/Serverless.", category: "deploy", status: "ready", accent: "#34d399" },
];

const CATEGORIES = [
  { id: "all", label: "All", count: ALL_CONNECTORS.length },
  { id: "models", label: "AI Models", count: ALL_CONNECTORS.filter((c) => c.category === "models").length },
  { id: "mcp", label: "MCP Servers", count: ALL_CONNECTORS.filter((c) => c.category === "mcp").length },
  { id: "storage", label: "Storage", count: ALL_CONNECTORS.filter((c) => c.category === "storage").length },
  { id: "tools", label: "Dev Tools", count: ALL_CONNECTORS.filter((c) => c.category === "tools").length },
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
              <Puzzle className="size-3" strokeWidth={2} />
              {conn.status === "coming" ? "Soon" : "Connect"}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
