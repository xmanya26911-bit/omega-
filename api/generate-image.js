// OMEGA Cloud — Image Generation Edge Function
// Uses Pollinations.ai (free, no API key)

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const { prompt, width, height } = await request.json();
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const w = Math.min(Math.max(parseInt(width) || 1024, 256), 2048);
    const h = Math.min(Math.max(parseInt(height) || 1024, 256), 2048);

    // Pollinations.ai — free, no auth, instant
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&private=true`;

    // Just return the URL — frontend loads the image
    return new Response(JSON.stringify({
      prompt,
      url,
      width: w,
      height: h,
      alt: `Generated image: ${prompt}`,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
