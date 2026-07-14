// OMEGA Cloud — Web Search Edge Function
// Multi-source: DuckDuckGo Instant Answer + Wikipedia (no API keys needed)

export const config = { runtime: 'edge' };

export default async function handler(request) {
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

    // ─── Source 1: DuckDuckGo Instant Answer ───
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
            source: 'DuckDuckGo',
          });
        }
        // Related topics
        if (ddgData.RelatedTopics) {
          for (const topic of ddgData.RelatedTopics) {
            if (topic.Text && results.length < 6) {
              results.push({
                title: topic.Text.split(' - ')[0] || 'Related',
                snippet: topic.Text,
                url: topic.FirstURL || '',
                source: 'DuckDuckGo',
              });
            }
            // Handle sub-topics
            if (topic.Topics) {
              for (const sub of topic.Topics) {
                if (sub.Text && results.length < 6) {
                  results.push({
                    title: sub.Text.split(' - ')[0] || 'Related',
                    snippet: sub.Text,
                    url: sub.FirstURL || '',
                    source: 'DuckDuckGo',
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) { /* DDG failed */ }

    // ─── Source 2: Wikipedia API ───
    if (results.length < 3) {
      try {
        // Try exact match first
        let wikiQuery = query.replace(/^(what is|who is|the|a|an) /i, '').trim();
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`;
        const wikiRes = await fetch(wikiUrl, { headers: { 'User-Agent': 'OmegaCloud/1.0' } });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.extract && wikiData.extract.length > 50) {
            let snippet = wikiData.extract;
            if (wikiData.description) snippet = wikiData.description + '\n\n' + snippet;
            results.push({
              title: wikiData.title || wikiQuery,
              snippet: snippet.slice(0, 600),
              url: wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiQuery)}`,
              source: 'Wikipedia',
            });
          }
        }
      } catch (e) { /* Wiki failed */ }
    }

    // ─── Source 3: Wikipedia search (fallback) ───
    if (results.length < 2) {
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json`;
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'OmegaCloud/1.0' } });
        if (searchRes.ok) {
          const [_, titles, snippets, urls] = await searchRes.json();
          if (titles && snippets) {
            for (let i = 0; i < titles.length && results.length < 4; i++) {
              results.push({
                title: titles[i],
                snippet: snippets[i] || '',
                url: urls[i] || '',
                source: 'Wikipedia',
              });
            }
          }
        }
      } catch (e) { /* Wiki search failed */ }
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
