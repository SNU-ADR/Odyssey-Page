const trackedWindows = new WeakSet();

// One page-load event. There is no cookie, visitor ID, or public statistics UI.
export function recordVisit(endpoint, win = window) {
  if (!endpoint || win.location.origin !== 'https://snu-adr.github.io'
    || win.location.pathname !== '/Odyssey-Page/' || trackedWindows.has(win)) return;
  try {
    if (new URL(endpoint).protocol !== 'https:') return;
  } catch { return; }
  trackedWindows.add(win);
  const send = () => {
    if (win.document.visibilityState !== 'visible') return;
    win.document.removeEventListener('visibilitychange', send);
    if (win.navigator.doNotTrack === '1' || win.navigator.globalPrivacyControl) return;
    try {
      let referrer = '';
      try { referrer = new URL(win.document.referrer).origin; } catch { /* Direct visit. */ }
      const payload = {
        eventId: win.crypto.randomUUID(),
        path: win.location.pathname,
        referrer,
      };
      void win.fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
        keepalive: true,
        referrerPolicy: 'no-referrer',
      }).catch(() => {});
    } catch { /* Logging must never interfere with the page or video playback. */ }
  };
  if (win.document.visibilityState === 'visible') send();
  else win.document.addEventListener('visibilitychange', send);
}
