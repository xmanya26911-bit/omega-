// OMEGA Cloud — Image Generation Edge Function
// Uses Pollinations.ai (free) with Flux/Stability fallback

export const config = { runtime: 'edge' };

const GOOGLE_CLIENT_ID = '855819039877-5f4a8biid8hkf8j2hhd1jk3bj9ng2f5f.apps.googleusercontent.com';
const ORIGIN = 'https://omega-nine-weld.vercel.app';

const tokenCache = new Map();
async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const cached = tokenCache.get(token);
  if (cached && cached.exp > Date.now() / 1000) return cached;
  try {
    const r = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    if (!r.ok) return null;
    const data = await r.json();
    if (data.aud !== GOOGLE_CLIENT_ID) return null;
    if (data.exp && parseInt(data.exp) < Date.now() / 1000) return null;
    const info = { email: data.email, sub: data.sub, exp: parseInt(data.exp || '0') };
    const ttl = Math.max(60, info.exp - Date.now() / 1000 - 300);
    tokenCache.set(token, info);
    setTimeout(() => tokenCache.delete(token), ttl * 1000);
    return info;
  } catch { return null; }
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN } });
  }

  const authInfo = await verifyToken(request.headers.get('Authorization'));
  if (!authInfo) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN } });
  }

  try {
    const { prompt, width, height, model } = await request.json();
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN } });
    }
    const w = Math.min(Math.max(parseInt(width) || 1024, 256), 2048);
    const h = Math.min(Math.max(parseInt(height) || 1024, 256), 2048);

    // Pollinations.ai — free, fast, no auth
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&private=true&seed=${Date.now()}`;

    return new Response(JSON.stringify({ prompt, url, width: w, height: h, alt: `Generated image: ${prompt}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN, 'Cache-Control': 'no-cache' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN } });
  }
}
