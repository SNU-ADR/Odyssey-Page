const MAX_BODY_BYTES = 2048;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clientInfo(userAgent) {
  const ua = userAgent.slice(0, 512);
  const browser = /Edg(?:e|A|iOS)?\//.test(ua) ? 'Edge'
    : /(?:OPR|Opera)\//.test(ua) ? 'Opera'
    : /(?:Firefox|FxiOS)\//.test(ua) ? 'Firefox'
    : /(?:Chrome|CriOS)\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari' : 'Other';
  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'tablet'
    : /Mobile|iPhone|iPod/i.test(ua) ? 'mobile' : 'desktop';
  return { browser, device };
}

async function readBody(request) {
  if (!request.body) throw new Error('Empty body');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error('Body too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default {
  async fetch(request, env) {
    const headers = { 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    const reply = status => new Response(null, { status, headers });
    // No public read, export, SQL, or administration endpoint.
    if (new URL(request.url).pathname !== '/visit') return reply(404);
    if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) return reply(403);
    headers['Access-Control-Allow-Origin'] = env.ALLOWED_ORIGIN;
    if (request.method === 'OPTIONS') {
      headers['Access-Control-Allow-Methods'] = 'POST';
      headers['Access-Control-Allow-Headers'] = 'Content-Type';
      headers['Access-Control-Max-Age'] = '86400';
      return reply(204);
    }
    if (request.method !== 'POST') return reply(405);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply(415);
    if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) return reply(413);
    if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1') return reply(204);

    let event;
    try { event = await readBody(request); } catch { return reply(400); }
    if (!event || typeof event.eventId !== 'string' || !UUID.test(event.eventId)
      || event.path !== env.ALLOWED_PATH || typeof event.referrer !== 'string') return reply(400);
    let referrerHost = '';
    if (event.referrer) {
      try {
        const url = new URL(event.referrer);
        if (!['https:', 'http:'].includes(url.protocol)) return reply(400);
        referrerHost = url.hostname.slice(0, 253);
      } catch { return reply(400); }
    }
    const { browser, device } = clientInfo(request.headers.get('User-Agent') || '');
    const country = /^[A-Z]{2}$/.test(request.cf?.country || '') ? request.cf.country : '';
    try {
      // A per-location global guard; no IP or persistent visitor identifier is
      // needed. This is best-effort spam control, not an authentication check.
      const { success } = await env.VISIT_LIMITER.limit({ key: 'visits' });
      if (!success) return reply(429);
      await env.DB.prepare(`
        INSERT INTO visits (event_id, page_path, referrer_host, country, browser, device_type)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(event_id) DO NOTHING
      `).bind(event.eventId, event.path, referrerHost, country, browser, device).run();
      return reply(204);
    } catch {
      // Do not expose SQL, account details, or request data in public errors.
      return reply(503);
    }
  },
};
