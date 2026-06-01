# Codex Rules for Focus Reading Launcher

## Product direction

- This repository is for **Focus Reading Launcher**, a quiet reading-session ritual tool.
- Keep the product local-first unless the user explicitly asks for backend, login, sync, or paid features.
- Preserve the three-stage flow: entry ritual → focused reading → exit ritual.
- Do not turn the UI into a generic todo list, CRM, social app, or AI-summary-first product.

## Front-end rules

- The MVP is intentionally static and deployable to GitHub Pages.
- Prefer plain HTML/CSS/JavaScript for small changes unless the user asks to migrate to a framework.
- Keep `web/index.html`, `web/styles.css`, and `web/app.js` readable and clearly separated by responsibility.
- User-facing copy should primarily be in Chinese, with short English labels acceptable for product terms like `Session`.
- Keep the visual style calm, minimal, low-distraction, and suitable for a library or bookstore.

## Data and privacy

- Do not add remote analytics, trackers, or network uploads by default.
- Store MVP records in `localStorage` unless a future task explicitly requests another persistence layer.
- Make privacy implications explicit when adding import, export, parsing, or AI features.

## Testing expectations

- Run `node --check web/app.js` after JavaScript changes.
- For static-serving checks, prefer `python3 -m http.server` and `curl -I`.
- If changing the visible UI, try to verify that `web/index.html` is reachable through a local static server.
