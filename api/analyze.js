// OMEGA Cloud — File Analysis Edge Function
// Supports CSV, JSON, TXT/MD, and image uploads

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
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const name = file.name;
    const ext = name.split('.').pop().toLowerCase();
    const bytes = await file.arrayBuffer();
    const size = bytes.byteLength;

    // Max 10MB
    if (size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large (max 10MB)' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const decoder = new TextDecoder('utf-8', { fatal: false });
    let result = { name, size, ext, type: 'unknown', content: '', rows: 0, preview: '' };

    if (['csv', 'tsv'].includes(ext)) {
      const text = decoder.decode(bytes);
      const lines = text.split('\n').filter(l => l.trim());
      const sep = ext === 'tsv' ? '\t' : ',';
      const parsed = lines.map(l => {
        // Handle quoted fields
        const row = [];
        let cur = '', inQuote = false;
        for (const ch of l) {
          if (ch === '"') { inQuote = !inQuote; continue; }
          if (ch === sep && !inQuote) { row.push(cur.trim()); cur = ''; continue; }
          cur += ch;
        }
        row.push(cur.trim());
        return row;
      });
      result.type = 'table';
      result.rows = parsed.length - 1;
      result.content = JSON.stringify(parsed);
      result.preview = parsed.slice(0, 5).map(r => r.join(' | ')).join('\n');
    } else if (['json'].includes(ext)) {
      const text = decoder.decode(bytes);
      try {
        const parsed = JSON.parse(text);
        result.type = 'json';
        result.content = JSON.stringify(parsed, null, 2).slice(0, 50000);
        result.preview = result.content.slice(0, 500);
      } catch {
        result.type = 'text';
        result.content = text.slice(0, 50000);
        result.preview = text.slice(0, 500);
      }
    } else if (['txt', 'md', 'log', 'py', 'js', 'ts', 'html', 'css', 'xml', 'yaml', 'yml', 'sql', 'sh', 'dockerfile', 'env', 'cfg', 'ini'].includes(ext)) {
      const text = decoder.decode(bytes);
      result.type = 'code';
      result.content = text.slice(0, 50000);
      result.preview = text.slice(0, 500);
    } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      result.type = 'image';
      result.content = `data:image/${mime};base64,${base64}`;
      result.preview = `[Image: ${name}, ${(size / 1024).toFixed(1)}KB]`;
    } else if (['pdf'].includes(ext)) {
      // Basic PDF text extraction (simple approach for Edge)
      const text = decoder.decode(bytes);
      // Strip PDF binary garbage, keep readable text
      const clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
                        .replace(/\(([^)]*)\)/g, '$1 ')
                        .replace(/\/[A-Za-z]+[^]*?>>/g, ' ')
                        .replace(/[^a-zA-Z0-9\s.,;:!?()\-–—'"\n]/g, ' ')
                        .replace(/\s+/g, ' ').trim();
      result.type = 'text';
      result.content = clean.slice(0, 50000);
      result.preview = clean.slice(0, 500);
    } else {
      // Binary / unknown — just return metadata
      result.type = 'binary';
      result.content = `[Binary file: ${name}, ${(size / 1024).toFixed(1)}KB]`;
      result.preview = result.content;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
