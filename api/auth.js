// OMEGA Cloud — OAuth Token Exchange (PKCE)
// Handles authorization code exchange and token refresh server-side

const GOOGLE_CLIENT_ID = '855819039877-5f4a8biid8hkf8j2hhd1jk3bj9ng2f5f.apps.googleusercontent.com';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ORIGIN = 'https://omega-nine-weld.vercel.app';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
    });
  }

  try {
    const body = await request.json();

    // ─── Refresh flow ───
    if (body.mode === 'refresh') {
      if (!body.refresh_token) {
        return new Response(JSON.stringify({ error: 'No refresh token' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
        });
      }

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: body.refresh_token,
      });
      if (process.env.GOOGLE_CLIENT_SECRET) params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);

      const res = await fetch(GOOGLE_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.error_description || 'Refresh failed' }), {
          status: res.status,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
        });
      }

      return new Response(JSON.stringify({ access_token: data.access_token, expires_in: data.expires_in }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
      });
    }

    // ─── Authorization code exchange ───
    if (!body.code || !body.code_verifier) {
      return new Response(JSON.stringify({ error: 'Missing code or code_verifier' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
      });
    }

    const params = new URLSearchParams({
      code: body.code,
      client_id: GOOGLE_CLIENT_ID,
      code_verifier: body.code_verifier,
      redirect_uri: body.redirect_uri || ORIGIN,
      grant_type: 'authorization_code',
    });
    if (process.env.GOOGLE_CLIENT_SECRET) params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);

    const res = await fetch(GOOGLE_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error_description || 'Auth failed' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
      });
    }

    // Fetch user email
    let email = '';
    try {
      const u = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + data.access_token } });
      if (u.ok) { const ui = await u.json(); email = ui.email || ''; }
    } catch {}

    return new Response(JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_in: data.expires_in,
      email,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN },
    });
  }
}
