// Debug proxy — returns the target URL and upstream response info
import { NextRequest } from "next/server";

export const runtime = "edge";

const OPENCODE_BASE = "https://opencode.ai/zen/v1";

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/v1", "");
  const target = new URL(path + url.search, OPENCODE_BASE);
  const method = req.method;

  try {
    const upstream = await fetch(target.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream, */*",
        "User-Agent": "OmegaCloud/1.0",
      },
      ...(method !== "GET" && method !== "HEAD"
        ? { body: await req.text() }
        : {}),
    });

    const text = await upstream.text();
    return new Response(
      JSON.stringify({
        target: target.toString(),
        status: upstream.status,
        contentType: upstream.headers.get("content-type"),
        bodyPreview: text.slice(0, 300),
        bodyLength: text.length,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ target: target.toString(), error: msg }), {
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
