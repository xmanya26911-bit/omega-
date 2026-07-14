// OMEGA Cloud — Models Edge Function
// Proxies OpenCode AI model list (cached)

export const config = {
  runtime: 'edge',
};

const GOOGLE_CLIENT_ID = '855819039877-5f4a8biid8hkf8j2hhd1jk3bj9ng2f5f.apps.googleusercontent.com';

const FREE_MODELS = new Set([
  'deepseek-v4-flash-free',
  'mimo-v2.5-free',
  'hy3-free',
  'nemotron-3-ultra-free',
  'north-mini-code-free',
]);

// ─── Token Verification ───
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
  const ORIGIN = 'https://omega-nine-weld.vercel.app';

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
    });
  }

  // Auth check
  const authInfo = await verifyToken(request.headers.get('Authorization'));
  if (!authInfo) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
    });
  }

  try {
    const res = await fetch('https://opencode.ai/zen/v1/models', {
      headers: { 'User-Agent': 'OmegaCloud/1.0' },
    });
    const data = await res.json();

    // Tag free models
    for (const model of data.data) {
      model.free = FREE_MODELS.has(model.id);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ORIGIN,
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
    });
  }
}
