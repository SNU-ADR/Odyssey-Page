-- Run these privately in Cloudflare's D1 console or with `wrangler d1 execute`.
-- Each record is a page load, not a unique person. Dates are stored in UTC.
SELECT substr(visited_at, 1, 10) AS day, count(*) AS page_views
FROM visits GROUP BY day ORDER BY day DESC;

SELECT country, count(*) AS page_views
FROM visits GROUP BY country ORDER BY page_views DESC;

SELECT referrer_host, count(*) AS page_views
FROM visits GROUP BY referrer_host ORDER BY page_views DESC;
