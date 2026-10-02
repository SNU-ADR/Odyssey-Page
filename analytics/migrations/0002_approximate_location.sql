-- Cloudflare IP-geolocation estimates, not browser GPS. Historical rows stay empty.
ALTER TABLE visits ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE visits ADD COLUMN region TEXT NOT NULL DEFAULT '';
ALTER TABLE visits ADD COLUMN latitude REAL;
ALTER TABLE visits ADD COLUMN longitude REAL;
