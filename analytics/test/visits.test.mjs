import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import { recordVisit } from '../../src/analytics/recordVisit.mjs';

const origin = 'https://snu-adr.github.io';
const endpoint = 'https://visits.example.com/visit';
const event = { eventId: '4f0db83b-aa68-458c-bbbf-a1bd1da91cf0', path: '/Odyssey-Page/', referrer: '' };
function environment(overrides = {}) {
  const rows = [];
  return { rows, ALLOWED_ORIGIN: origin, ALLOWED_PATH: event.path,
    VISIT_LIMITER: { limit: async () => ({ success: true }) },
    DB: { prepare: sql => ({ bind: (...values) => ({ run: async () => { rows.push({ sql, values }); } }) }) },
    ...overrides };
}
function request(body = event, headers = {}, method = 'POST') {
  return new Request(endpoint, { method,
    headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
    ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
}

test('stores a bounded event, server country and coarse device information, without IP or full URLs', async () => {
  const env = environment();
  const req = request({ ...event, referrer: 'https://example.com/private?token=secret' }, {
    'CF-Connecting-IP': '192.0.2.10', 'User-Agent': 'Mozilla/5.0 iPhone Mobile Safari/605.1',
  });
  Object.defineProperty(req, 'cf', { value: { country: 'KR' } });
  const result = await worker.fetch(req, env);
  assert.equal(result.status, 204);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), origin);
  assert.deepEqual(env.rows[0].values, [event.eventId, event.path, 'example.com', 'KR', 'Safari', 'mobile']);
  assert.match(env.rows[0].sql, /ON CONFLICT\(event_id\) DO NOTHING/);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
});

test('rejects foreign origins, read requests, invalid events and oversized bodies without writing', async () => {
  for (const [req, status] of [
    [request(event, { Origin: 'https://other.example' }), 403],
    [request(event, {}, 'GET'), 405],
    [request(event, {}, 'HEAD'), 405],
    [new Request('https://visits.example.com/export', { headers: { Origin: origin } }), 404],
    [request({ ...event, path: '/Other-Project/' }), 400],
    [request({ ...event, eventId: 'not-a-uuid' }), 400],
    [request({ ...event, referrer: 'javascript:alert(1)' }), 400],
    [request({ ...event, referrer: 'x'.repeat(3000) }), 400],
    [request(event, { 'Content-Type': 'text/plain' }), 415],
  ]) {
    const env = environment();
    assert.equal((await worker.fetch(req, env)).status, status);
    assert.equal(env.rows.length, 0);
  }
});

test('preflight, privacy preferences, rate limits and DB failures behave without leaking data', async () => {
  for (const [headers, method] of [[{}, 'OPTIONS'], [{ DNT: '1' }, 'POST'], [{ 'Sec-GPC': '1' }, 'POST']]) {
    const env = environment();
    assert.equal((await worker.fetch(request(event, headers, method), env)).status, 204);
    assert.equal(env.rows.length, 0);
  }
  const limited = environment({ VISIT_LIMITER: { limit: async () => ({ success: false }) } });
  assert.equal((await worker.fetch(request(), limited)).status, 429);
  assert.equal(limited.rows.length, 0);
  const failed = environment({ DB: { prepare: () => { throw new Error('private database details'); } } });
  const result = await worker.fetch(request(), failed);
  assert.equal(result.status, 503);
  assert.equal(await result.text(), '');
});

function browser() {
  const requests = [];
  const listeners = new Map();
  return { requests, listeners,
    location: { origin, pathname: event.path },
    navigator: {}, crypto: { randomUUID: () => event.eventId },
    document: { visibilityState: 'visible', referrer: 'https://example.com/path?q=secret',
      addEventListener: (type, fn) => listeners.set(type, fn),
      removeEventListener: type => listeners.delete(type) },
    fetch: async (...args) => { requests.push(args); },
  };
}

test('client sends once per page load and strips referrer paths; no identifiers persist', () => {
  const win = browser();
  recordVisit(endpoint, win); recordVisit(endpoint, win);
  assert.equal(win.requests.length, 1);
  const [url, options] = win.requests[0];
  assert.equal(url, endpoint);
  assert.deepEqual(JSON.parse(options.body), { ...event, referrer: 'https://example.com' });
  assert.equal(options.credentials, 'omit');
  assert.equal(options.referrerPolicy, 'no-referrer');
});

test('client skips unconfigured, local, other-project and privacy opt-out visits', () => {
  for (const setup of [
    win => { win.location.origin = 'http://localhost:3000'; },
    win => { win.location.pathname = '/Other-Project/'; },
    win => { win.navigator.doNotTrack = '1'; },
    win => { win.navigator.globalPrivacyControl = true; },
  ]) {
    const win = browser(); setup(win); recordVisit(endpoint, win);
    assert.equal(win.requests.length, 0);
  }
  const win = browser();
  recordVisit('', win); recordVisit('http://insecure.example/visit', win);
  assert.equal(win.requests.length, 0);
});

test('client waits for visible tab and failed logging does not break the page', async () => {
  const win = browser(); win.document.visibilityState = 'hidden';
  recordVisit(endpoint, win); recordVisit(endpoint, win);
  assert.equal(win.requests.length, 0);
  win.listeners.get('visibilitychange')();
  assert.equal(win.requests.length, 0);
  win.document.visibilityState = 'visible';
  win.listeners.get('visibilitychange')();
  assert.equal(win.requests.length, 1);
  assert.equal(win.listeners.size, 0);
  const offline = browser(); offline.fetch = async () => { throw new Error('offline'); };
  assert.doesNotThrow(() => recordVisit(endpoint, offline));
  await new Promise(resolve => setTimeout(resolve, 0));
});
