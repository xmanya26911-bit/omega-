// OMEGA Cloud — Web Search Edge Function
// Proxies search queries through DuckDuckGo (no API key needed)

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { query } = await request.json();
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'No query provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const results = [];

    // 1. Try DuckDuckGo Instant Answer API
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        if (ddgData.AbstractText) {
          results.push({
            title: ddgData.Heading || 'Summary',
            snippet: ddgData.AbstractText,
            url: ddgData.AbstractURL || '',
          });
        }
        if (ddgData.Infobox && ddgData.Infobox.content) {
          for (const item of ddgData.Infobox.content) {
            if (item.label && item.value) {
              results.push({
                title: item.label,
                snippet: typeof item.value === 'string' ? item.value : JSON.stringify(item.value),
                url: '',
              });
            }
          }
        }
      }
    } catch (e) {
      // Instant answer failed, continue to HTML fallback
    }

    // 2. Fetch HTML search results for web links
    try {
      const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const htmlRes = await fetch(htmlUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();

        // Parse result blocks
        const blocks = html.split('<div class="result__body">');
        for (let i = 1; i < blocks.length && results.length < 8; i++) {
          const block = blocks[i];

          // Extract title
          const titleMatch = block.match(/<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

          // Extract snippet
          const snippetMatch = block.match(/<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
          let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

          // Extract URL
          const urlMatch = block.match(/<a[^>]+class="result__url"[^>]*href="([^"]*)"/);
          let url = urlMatch ? urlMatch[1] : '';
          if (url.startsWith('//')) url = 'https:' + url;

          if (title) {
            results.push({ title, snippet, url });
          }
        }
      }
    } catch (e) {
      // HTML fallback failed
    }

    return new Response(JSON.stringify({ results, query }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
