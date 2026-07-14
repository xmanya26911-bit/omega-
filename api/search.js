// OMEGA Cloud — Web Search Edge Function
// Multi-source: DuckDuckGo + Wikipedia + fallback web scrape

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
    const { query } = await request.json();
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN } });
    }

    const results = [];
    const q = query.trim();

    // ─── Source 1: DuckDuckGo Instant Answer ───
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        if (ddgData.AbstractText) {
          results.push({ title: ddgData.Heading || 'Summary', snippet: ddgData.AbstractText, url: ddgData.AbstractURL || '', source: 'DuckDuckGo' });
        }
        for (const topic of (ddgData.RelatedTopics || [])) {
          if (topic.Text && results.length < 6) results.push({ title: topic.Text.split(' - ')[0] || 'Related', snippet: topic.Text, url: topic.FirstURL || '', source: 'DuckDuckGo' });
          if (topic.Topics) for (const sub of topic.Topics) {
            if (sub.Text && results.length < 6) results.push({ title: sub.Text.split(' - ')[0] || 'Related', snippet: sub.Text, url: sub.FirstURL || '', source: 'DuckDuckGo' });
          }
        }
      }
    } catch {}

    // ─── Source 2: Wikipedia ───
    if (results.length < 3) {
      try {
        const wikiQ = q.replace(/^(what is|who is|the|a|an) /i, '').trim();
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQ)}`, { headers: { 'User-Agent': 'OmegaCloud/1.0' } });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.extract && wikiData.extract.length > 50) {
            results.push({ title: wikiData.title || wikiQ, snippet: wikiData.extract.slice(0, 600), url: wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiQ)}`, source: 'Wikipedia' });
          }
        }
      } catch {}
    }

    // ─── Source 3: Wikipedia open search (fallback) ───
    if (results.length < 2) {
      try {
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=3&format=json`, { headers: { 'User-Agent': 'OmegaCloud/1.0' } });
        if (searchRes.ok) {
          const [_, titles, snippets, urls] = await searchRes.json();
          if (titles) for (let i = 0; i < titles.length && results.length < 4; i++) {
            results.push({ title: titles[i], snippet: snippets[i] || '', url: urls[i] || '', source: 'Wikipedia' });
          }
        }
      } catch {}
    }

    // Return with citation-ready format
    return new Response(JSON.stringify({ results, query: q, total: results.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN, 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN } });
  }
}
