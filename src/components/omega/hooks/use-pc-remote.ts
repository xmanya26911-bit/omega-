"use client";

import * as React from "react";

export interface PCRemoteState {
  status: string;
  hostname: string | null;
  error: string | null;
  exec: (command: string) => Promise<string>;
  reconnect: () => void;
}

const PCRemoteContext = React.createContext<PCRemoteState | null>(null);

export function PCRemoteProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState("disconnected");
  const [hostname, setHostname] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const value = React.useMemo(
    () => ({
      status,
      hostname,
      error,
      exec: async (cmd: string) => "Not implemented",
      reconnect: () => {},
    }),
    [status, hostname, error]
  );

  return React.createElement(PCRemoteContext.Provider, { value }, children);
}
