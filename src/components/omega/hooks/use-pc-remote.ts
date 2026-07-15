"use client";

import * as React from "react";

// ── Types ──────────────────────────────────────────────────────────────
export type AgentStatus = "disconnected" | "connecting" | "online" | "offline";

export interface ExecResult {
  id: string;
  stdout: string;
  stderr: string;
  exit_code: number;
}

export interface PCRemoteState {
  /** Connection status of the relay */
  status: AgentStatus;
  /** Hostname of the remote PC */
  hostname: string | null;
  /** Operating system of the remote PC */
  os: string | null;
  /** Last error message */
  error: string | null;
  /** Send a shell command to the remote PC */
  exec: (command: string, cwd?: string) => Promise<ExecResult>;
  /** List a directory on the remote PC */
  listDir: (path: string) => Promise<string[]>;
  /** Reconnect manually */
  reconnect: () => void;
}

// ── Config ────────────────────────────────────────────────────────────
const RELAY_URL = "wss://omega-relay.onrender.com";
const RELAY_TOKEN = ""; // Set via Vercel env: NEXT_PUBLIC_RELAY_TOKEN

// ── React context ─────────────────────────────────────────────────────
const PCRemoteContext = React.createContext<PCRemoteState | null>(null);

let cmdCounter = 0;

export function PCRemoteProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AgentStatus>("disconnected");
  const [hostname, setHostname] = React.useState<string | null>(null);
  const [os, setOs] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const wsRef = React.useRef<WebSocket | null>(null);
  const pendingRef = React.useRef<
    Map<string, { resolve: (v: ExecResult) => void; reject: (e: Error) => void }>
  >(new Map());
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = React.useCallback(() => {
    if (!RELAY_TOKEN) {
      setError("RELAY_TOKEN not configured");
      setStatus("offline");
      return;
    }

    setStatus("connecting");
    const uri = `${RELAY_URL}?role=client&token=${RELAY_TOKEN}`;

    try {
      const ws = new WebSocket(uri);

      ws.onopen = () => {
        console.log("[PCRemote] Connected to relay");
        setStatus("online");
        setError(null);
      };

      ws.onclose = () => {
        console.log("[PCRemote] Disconnected");
        setStatus("offline");
        wsRef.current = null;
        // Auto-reconnect after 5s
        reconnectTimerRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (e) => {
        console.error("[PCRemote] WebSocket error");
        setError("WebSocket connection failed");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const type = msg.type;

          if (type === "status") {
            if (msg.agent === "offline") {
              setStatus("offline");
            } else if (msg.agent === "online") {
              setStatus("online");
            }
            return;
          }

          if (type === "identity") {
            if (msg.hostname) setHostname(msg.hostname);
            if (msg.os) setOs(msg.os);
            return;
          }

          if (type === "output") {
            const id = msg.id;
            const pending = pendingRef.current.get(id);
            if (pending) {
              pending.resolve(msg as ExecResult);
              pendingRef.current.delete(id);
            }
            return;
          }

          if (type === "dir_list") {
            const id = msg.id;
            const pending = pendingRef.current.get(id);
            if (pending) {
              // Also works for directory listing results
              pending.resolve({
                id: msg.id,
                stdout: JSON.stringify(msg.items || []),
                stderr: msg.error || "",
                exit_code: msg.error ? 1 : 0,
              });
              pendingRef.current.delete(id);
            }
            return;
          }

          if (type === "error") {
            console.error("[PCRemote]", msg.message);
            setError(msg.message);
          }
        } catch {
          // ignore malformed messages
        }
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("[PCRemote] Failed to create WebSocket:", e);
      setStatus("offline");
      setError("Failed to create WebSocket connection");
    }
  }, []);

  // Connect on mount
  React.useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [connect]);

  const exec = React.useCallback(
    (command: string, cwd?: string): Promise<ExecResult> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error("Not connected to relay"));
          return;
        }

        const id = `cmd_${++cmdCounter}_${Date.now()}`;
        pendingRef.current.set(id, { resolve, reject });

        ws.send(
          JSON.stringify({
            type: "exec",
            id,
            command,
            cwd: cwd || undefined,
          })
        );

        // Timeout after 130s
        setTimeout(() => {
          const p = pendingRef.current.get(id);
          if (p) {
            pendingRef.current.delete(id);
            reject(new Error("Command timed out"));
          }
        }, 130_000);
      });
    },
    []
  );

  const listDir = React.useCallback(
    (path: string): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error("Not connected to relay"));
          return;
        }

        const id = `ls_${++cmdCounter}_${Date.now()}`;
        pendingRef.current.set(id, {
          resolve: (result: ExecResult) => {
            try {
              const items = JSON.parse(result.stdout);
              resolve(items);
            } catch {
              resolve([]);
            }
          },
          reject,
        });

        ws.send(
          JSON.stringify({
            type: "list_dir",
            id,
            path,
          })
        );
      });
    },
    []
  );

  const reconnect = React.useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  const value = React.useMemo(
    () => ({ status, hostname, os, error, exec, listDir, reconnect }),
    [status, hostname, os, error, exec, listDir, reconnect]
  );

  return (
    <PCRemoteContext.Provider value={value}>
      {children}
    </PCRemoteContext.Provider>
  );
}

export function usePCRemote(): PCRemoteState {
  const ctx = React.useContext(PCRemoteContext);
  if (!ctx) {
    throw new Error("usePCRemote must be used within PCRemoteProvider");
  }
  return ctx;
}
