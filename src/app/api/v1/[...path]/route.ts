// Omega Cloud — OpenCode proxy (OpenAI-compatible)
// https://omega-nine-weld.vercel.app/v1/* → https://opencode.ai/zen/v1/**
// Lets users point any OpenAI client at our domain.

import { NextRequest } from "next/server";

export const runtime = "edge";

const OPENCODE_BASE = "https://opencode.ai/zen/v1";

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/v1", ""); // strip /api prefix — renders as /v1
  const target = new URL(path + url.search, OPENCODE_BASE);

  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    // @ts-expect-error — duplex required for streaming body
    init.duplex = "half";
  }

  try {
    const upstream = await fetch(target.toString(), init);

    const respHeaders = new Headers(upstream.headers);
    respHeaders.delete("set-cookie"); // don't leak upstream cookies

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
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
