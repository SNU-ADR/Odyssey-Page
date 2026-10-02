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
