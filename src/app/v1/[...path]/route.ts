// Omega Cloud — OpenCode proxy (OpenAI-compatible)
// Debug version — returns info about the upstream response.

import { NextRequest } from "next/server";

export const runtime = "edge";

const OPENCODE_BASE = "https://opencode.ai/zen/v1";

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/v1", "");
  const target = new URL(path + url.search, OPENCODE_BASE);

  // Minimal headers — just like the working chat route
  const bodyText = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  // Debug: return info about what we got from OpenCode
  const debugInfo: Record<string, unknown> = {
    target: target.toString(),
    method: req.method,
    bodyLength: bodyText?.length || 0,
    path,
  };

  try {
    const res = await fetch(target.toString(), {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      ...(bodyText !== undefined ? { body: bodyText } : {}),
    });

    const text = await res.text();
    debugInfo.upstreamStatus = res.status;
    debugInfo.upstreamContentType = res.headers.get("content-type");
    debugInfo.upstreamBodyLength = text.length;
    debugInfo.upstreamBodyPreview = text.slice(0, 500);

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    debugInfo.error = msg;
    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
