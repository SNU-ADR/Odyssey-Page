# Odyssey Project Page

Project page for Odyssey, a closed-loop benchmark for long-horizon driving with explicit navigation routes.

## nuPlan attribution and licensing

Odyssey uses [nuPlan](https://www.nuscenes.org/nuplan), provided by Motional AD Inc.
and its affiliates. The dataset is available under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) and the
[Motional dataset terms](https://www.nuscenes.org/terms-of-use), subject to
item-specific exceptions. The dataset terms also apply to data-derived material.

The nuPlan-derived visual content and Odyssey's adaptations of that content on
this site are shared under those conditions. The
[attribution and license notice](public/notices/nuplan.html) identifies the
covered media and describes the reconstruction, simulation, refinement, and
editing applied. It is linked from the footer and included in the deployed site.
Keep that attribution with exported or redistributed media, and preserve any
additional source-specific notices when adding new assets.

The [nuPlan devkit license](https://github.com/motional/nuplan-devkit/blob/master/LICENSE.txt)
is Apache 2.0 (Copyright 2021 Motional); it is separate from the dataset license.
This notice does not set a blanket license for the website code, research code,
paper, branding, or model weights.

Official sources checked on October 2, 2026. Dataset terms displayed an update
date of November 16, 2021 at the time of review.

## Local development

```bash
npm install
npm start
```

Create a production build with:

```bash
npm run build
```

## GitHub Pages

Site address: https://snu-adr.github.io/Odyssey-Page/

Every push to `main` runs `.github/workflows/pages.yml`, builds the React app,
and deploys the resulting `build/` directory to GitHub Pages. No separate
`gh-pages` branch or local build is needed.

After committing your changes, publish them with:

```bash
git push origin main
```

`npm run deploy` is an alias for this push. Deployment progress appears in
**Actions → Deploy Odyssey to GitHub Pages**. The public site updates only
after the workflow succeeds.

For initial setup, select **Settings → Pages → Source → GitHub Actions**.
The workflow selects `main` as its source branch. If the `github-pages`
environment restricts deployment branches, allow `main`.

The build disables the ESLint plugin to bypass the existing dependency error
and omits source maps from the published files. Results stays hidden according
to `src/App.jsx`; deployments always use the content in the pushed commit.

## Private visit records

`analytics/` contains a Cloudflare Worker and D1 schema. The page sends one
record per page load; it has no counter or statistics display. The collector
stores a UTC server timestamp, page path, referring hostname, country, browser
family, device category, and Cloudflare's approximate city/region/coordinates.
Latitude and longitude are rounded to two decimals and are IP-location estimates,
not GPS or a person's exact location; VPNs and network routing can affect accuracy.
Missing coordinates remain null, including historical records collected before
the location update. No browser location permission is requested.
It does not store IP addresses, raw user agents,
referrer paths/query strings, cookies, or persistent visitor IDs. Reloads count
as additional page views, not unique visitors. An event ID prevents duplicate
inserts of the same request.

`src/data/analytics.json` points to the deployed HTTPS `/visit` endpoint.
Set its `endpoint` to an empty string and redeploy the page to disable collection.
Collection runs only in production on
`https://snu-adr.github.io/Odyssey-Page/`; local previews do not send records.
Hidden tabs wait until visible, and DNT/GPC opt-outs are honored. Network errors
or blockers can prevent records from arriving without affecting the page.

The existing collector uses the D1 database configured in
`analytics/wrangler.jsonc`. Use Node 22 or newer. For updates, log in and run
`npm run deploy` inside `analytics/`. The Cloudflare account email must be verified.
To create a separate installation:

```bash
cd analytics
npm ci
npx wrangler login --scopes account:read user:read workers:write workers_scripts:write d1:write
npx wrangler d1 create odyssey-visits
```

Replace `database_id` in `analytics/wrangler.jsonc` with the
ID returned by D1, then initialize and deploy:

```bash
npx wrangler d1 migrations apply odyssey-visits --remote
npm run deploy
```

Put the printed Worker URL plus `/visit` into `src/data/analytics.json`, then
commit and push `main` to deploy the page. The endpoint and database ID are
public configuration, not credentials. Cloudflare authentication stays outside
the repository. Deploying the GitHub page does not deploy the separate Worker.

The Worker exposes only `POST /visit` and CORS preflight; there is no public read
or SQL endpoint. Read records in **Cloudflare → D1 → odyssey-visits → Console**.
Example private aggregation queries are in `analytics/queries.sql`. To back up
the raw records locally:

```bash
cd analytics
mkdir -p exports
npx wrangler d1 export odyssey-visits --remote --output=exports/visits.sql
```

Exports and local DB state are Git-ignored. Keep them outside `public/` and
`build/`. Exporting does not delete records. Records remain until explicitly deleted; monitor D1's
storage and write limits in the Cloudflare dashboard. Origin checks and a
per-Cloudflare-location rate limit reduce unwanted writes but cannot prove that
each event is a human visit. No paid-plan upgrade is required by these scripts.

Run collector/client tests with `npm --prefix analytics test`.
