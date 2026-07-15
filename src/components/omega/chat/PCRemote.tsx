"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  FolderOpen,
  FileCode,
  X,
  Loader2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PCStatus = "disconnected" | "connecting" | "online" | "offline";
type LineType = "input" | "output" | "error" | "system";

interface CLine {
  id: number;
  text: string;
  type: LineType;
}

let lineId = 0;
let cmdCounter = 0;

export function PCRemotePanel() {
  const [status, setStatus] = React.useState<PCStatus>("disconnected");
  const [hostname, setHostname] = React.useState<string | null>(null);
  const [lines, setLines] = React.useState<CLine[]>([
    { id: ++lineId, text: "PC Remote Agent — waiting for connection", type: "system" },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [showExplorer, setShowExplorer] = React.useState(false);
  const [explorerPath, setExplorerPath] = React.useState("D:\\TERMINALCLI");
  const [explorerItems, setExplorerItems] = React.useState<string[]>([]);
  const [explorerBusy, setExplorerBusy] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const wsRef = React.useRef<WebSocket | null>(null);
  const pendingRef = React.useRef<Map<string, (data: any) => void>>(new Map());

  const addLine = (text: string, type: LineType) => {
    setLines((prev) => [...prev, { id: ++lineId, text, type }]);
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  React.useEffect(() => {
    const RELAY_TOKEN = process.env.NEXT_PUBLIC_RELAY_TOKEN || "";
    if (!RELAY_TOKEN) {
      setStatus("offline");
      addLine("RELAY_TOKEN not configured — set NEXT_PUBLIC_RELAY_TOKEN", "error");
      return;
    }
    setStatus("connecting");
    const ws = new WebSocket(`wss://omega-relay.onrender.com/ws?role=client&token=${RELAY_TOKEN}`);
    ws.onopen = () => {
      setStatus("online");
      setHostname("Connected");
      addLine("Connected to PC relay", "system");
    };
    ws.onclose = () => {
      setStatus("offline");
      wsRef.current = null;
    };
    ws.onerror = () => {
      setStatus("offline");
      addLine("WebSocket connection failed", "error");
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "status":
            if (msg.agent === "offline") {
              setStatus("offline");
              addLine("PC agent went offline", "system");
            }
            break;
          case "identity":
            if (msg.hostname) setHostname(msg.hostname);
            if (msg.os) addLine("OS: " + msg.os, "system");
            break;
          case "error":
            addLine("Error: " + msg.message, "error");
            break;
          default:
            if (msg.id) {
              const cb = pendingRef.current.get(msg.id);
              if (cb) {
                cb(msg);
                pendingRef.current.delete(msg.id);
              }
            }
        }
      } catch {
        // ignore malformed messages
      }
    };
    wsRef.current = ws;
    return () => {
      ws.close();
    };
  }, []);

  const sendCommand = React.useCallback(
    (command: string, cwd?: string): Promise<{ stdout: string; stderr: string; exit_code: number }> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error("Not connected"));
          return;
        }
        const id = `c_${++cmdCounter}_${Date.now()}`;
        pendingRef.current.set(id, resolve);
        ws.send(JSON.stringify({ type: "exec", id, command, cwd: cwd || undefined }));
        setTimeout(() => {
          if (pendingRef.current.has(id)) {
            pendingRef.current.delete(id);
            reject(new Error("Command timed out"));
          }
        }, 120_000);
      });
    },
    []
  );

  const listDir = React.useCallback(
    (path: string): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error("Not connected"));
          return;
        }
        const id = `ls_${++cmdCounter}_${Date.now()}`;
        pendingRef.current.set(id, (msg) => {
          if (msg.items) resolve(msg.items);
          else resolve([]);
        });
        ws.send(JSON.stringify({ type: "list_dir", id, path }));
      });
    },
    []
  );

  const handleSubmit = async () => {
    const cmd = input.trim();
    if (!cmd || busy) return;
    setInput("");
    addLine("$ " + cmd, "input");
    setBusy(true);
    try {
      const result = await sendCommand(cmd);
      if (result.stdout)
        result.stdout.split("\n").forEach((l) => { if (l.trim()) addLine(l, "output"); });
      if (result.stderr)
        result.stderr.split("\n").forEach((l) => { if (l.trim()) addLine(l, "error"); });
      addLine("→ exit " + result.exit_code, "system");
    } catch (e: unknown) {
      addLine(e instanceof Error ? e.message : "Command failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const openExplorer = async () => {
    if (explorerBusy) return;
    setExplorerBusy(true);
    try {
      const items = await listDir(explorerPath);
      setExplorerItems(items);
      setShowExplorer(true);
    } catch (e: unknown) {
      addLine(e instanceof Error ? e.message : "Failed to list directory", "error");
    } finally {
      setExplorerBusy(false);
    }
  };

  const explorerSelect = async (item: string) => {
    const newPath = explorerPath.endsWith("\\") ? explorerPath + item : explorerPath + "\\" + item;
    setExplorerPath(newPath);
    setExplorerBusy(true);
    try {
      const items = await listDir(newPath);
      setExplorerItems(items);
    } catch { addLine("Selected: " + newPath, "system"); } finally { setExplorerBusy(false); }
  };

  const explorerGoUp = () => {
    const p = explorerPath.replace(/\\[^\\]*$/, "");
    if (p && p.length >= 3) { setExplorerPath(p); openExplorer(); }
  };

  const statusColor = status === "online" ? "var(--omega-emerald)" : status === "connecting" ? "var(--omega-amber)" : "var(--omega-rose)";

  return (
    <div className="flex h-full flex-col">
      {/* Connection bar */}
      <div className="flex items-center gap-2 border-b border-[var(--omega-glass-border)] px-3 py-2" style={{ backgroundColor: `color-mix(in srgb, ${statusColor} 10%, transparent)` }}>
        <span className="relative flex h-2 w-2" style={{ color: statusColor }}>
          {status === "online" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ backgroundColor: statusColor }} />}
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }} />
        </span>
        <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--omega-fg-dim)]">
          {status === "online" ? "PC: " + (hostname || "Connected") : status === "connecting" ? "Connecting..." : "PC Offline"}
        </span>
      </div>

      {/* Quick actions */}
      {status === "online" && (
        <div className="flex items-center gap-1 border-b border-[var(--omega-glass-border)] px-2 py-1.5">
          <button type="button" onClick={openExplorer} disabled={explorerBusy} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[var(--omega-fg-dim)] transition-colors hover:text-[var(--omega-emerald)]">
            {explorerBusy ? <Loader2 className="size-3 animate-spin" /> : <FolderOpen className="size-3" />} Explorer
          </button>
          <button type="button" onClick={() => { 
            addLine("Listing D:\\TERMINALCLI ...", "system");
            sendCommand("dir D:\\TERMINALCLI /B").then(r => {
              if (r.stdout) r.stdout.split("\n").filter(Boolean).forEach(l => addLine(l, "output"));
              addLine("→ exit " + r.exit_code, "system");
            }).catch(e => addLine(String(e), "error"));
          }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[var(--omega-fg-dim)] transition-colors hover:text-[var(--omega-emerald)]">
            <FileCode className="size-3" /> Projects
          </button>
        </div>
      )}

      {/* File Explorer */}
      <AnimatePresence>
        {showExplorer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-[var(--omega-glass-border)]">
            <div className="px-3 py-2">
              <div className="mb-1 flex items-center gap-1">
                <button type="button" onClick={explorerGoUp} className="rounded px-1.5 py-0.5 text-[10px] text-[var(--omega-fg-dim)] hover:text-[var(--omega-emerald)]">..</button>
                <span className="flex-1 truncate font-mono text-[9px] text-[var(--omega-muted)]">{explorerPath}</span>
                <button type="button" onClick={() => setShowExplorer(false)} className="rounded px-1 py-0.5 text-[var(--omega-fg-dim)] hover:text-[var(--omega-rose)]"><X className="size-3" /></button>
              </div>
              <div className="max-h-32 overflow-y-auto rounded-lg bg-[var(--omega-bg-2)] p-1">
                {explorerBusy ? (
                  <div className="flex items-center justify-center py-4"><Loader2 className="size-4 animate-spin text-[var(--omega-muted)]" /></div>
                ) : explorerItems.length === 0 ? (
                  <div className="py-2 text-center text-[10px] text-[var(--omega-muted)]">Empty directory</div>
                ) : explorerItems.map((item) => (
                  <button key={item} type="button" onClick={() => explorerSelect(item)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[10px] text-[var(--omega-fg-dim)] transition-colors hover:text-[var(--omega-fg)]">
                    <ChevronRight className="size-2.5 shrink-0 text-[var(--omega-muted)]" /> {item}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
        {lines.map((l) => (
          <div key={l.id} className={cn(
            "whitespace-pre-wrap break-all",
            l.type === "input" && "text-[var(--omega-emerald)]",
            l.type === "output" && "text-[var(--omega-fg)]",
            l.type === "error" && "text-[var(--omega-rose)]",
            l.type === "system" && "text-[var(--omega-muted)] italic"
          )}>{l.text}</div>
        ))}
        {busy && <div className="flex items-center gap-2 text-[var(--omega-muted)]"><Loader2 className="size-3 animate-spin" /> Running...</div>}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--omega-glass-border)] px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--omega-glass-border)] bg-[var(--omega-bg-2)] px-2.5 py-1.5">
          <span className="font-mono text-[10px] text-[var(--omega-emerald)]">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={status === "online" ? "Enter command..." : "Waiting for connection..."}
            disabled={status !== "online" || busy}
            className="w-full bg-transparent text-xs text-[var(--omega-fg)] placeholder:text-[var(--omega-muted)] focus:outline-none disabled:opacity-40"
          />
          {busy && <Loader2 className="size-3 animate-spin text-[var(--omega-muted)]" />}
        </div>
      </div>
    </div>
  );
}
