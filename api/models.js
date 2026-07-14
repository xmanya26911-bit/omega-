// OMEGA Cloud — Models Edge Function
// Proxies OpenCode AI model list (cached)

export const config = {
  runtime: 'edge',
};

const FREE_MODELS = new Set([
  'deepseek-v4-flash-free',
  'mimo-v2.5-free',
  'hy3-free',
  'nemotron-3-ultra-free',
  'north-mini-code-free',
]);

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
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
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
