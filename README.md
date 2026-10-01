# Odyssey Project Page

Project page for Odyssey, a closed-loop benchmark for long-horizon driving with explicit navigation routes.

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

Publish the current production build to the `gh-pages` branch:

```bash
DISABLE_ESLINT_PLUGIN=true npm run deploy
```

The environment variable bypasses the existing local ESLint dependency error during the build.

For initial setup, a repository administrator must enable **Settings → Pages →
Deploy from a branch**, selecting **gh-pages** and **/ (root)**. Publishing the
branch alone does not enable GitHub Pages. The source repository can remain
private if the organization's GitHub plan supports Pages for private repositories.
