// Omega Cloud — OpenCode proxy (OpenAI-compatible)
// https://omega-nine-weld.vercel.app/v1/* → https://opencode.ai/zen/v1/**
// Transparent pass-through for GET (models, etc.) and POST (chat completions).

import { NextRequest } from "next/server";

export const runtime = "edge";

const OPENCODE_BASE = "https://opencode.ai/zen/v1";

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/v1", "");
  const target = new URL(path + url.search, OPENCODE_BASE);

  try {
    const upstream = await fetch(target.toString(), {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("authorization")
          ? { Authorization: req.headers.get("authorization")! }
          : {}),
      },
      ...(req.method !== "GET" && req.method !== "HEAD"
        ? { body: await req.text() }
        : {}),
    });

    const respHeaders = new Headers(upstream.headers);
    respHeaders.delete("set-cookie");

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
