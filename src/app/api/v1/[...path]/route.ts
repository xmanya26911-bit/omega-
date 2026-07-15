// Test route — returns JSON to verify route matching works
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({ status: "ok", path: req.url }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return new Response(
    JSON.stringify({ status: "ok", method: "POST", bodyLength: body.length }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
