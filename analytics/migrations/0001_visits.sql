CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  visited_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  page_path TEXT NOT NULL,
  referrer_host TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL,
  device_type TEXT NOT NULL
);
