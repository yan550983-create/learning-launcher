# Focus Reading Launcher

A local-first browser MVP for turning links, pasted text, and local files into focused, time-boxed reading sessions.

The project is intentionally small: no backend, no account system, no analytics, and no external API dependency. It is designed to reduce the friction between “I should read this” and actually completing one bounded reading session.

## What it does

- Accepts a webpage URL, pasted text, or a local text/Markdown file
- Creates a reading session with a fixed time box
- Adds a short entry ritual before the timer starts
- Tracks time progress and manual reading progress
- Lets the user capture key points during the session
- Requires a one-sentence takeaway before the session is closed
- Stores recent reading history in browser `localStorage`
- Keeps all material local by default

## Why I built it

I wanted a lightweight tool for focused reading in places like libraries, bookstores, and commutes. Instead of becoming another task manager or knowledge base, the app treats reading as a small state machine:

`material -> entry -> focus -> exit -> record`

The main product constraint is deliberate: reduce setup cost, keep the session bounded, and make the user leave with one explicit takeaway.

## Tech

- Vanilla HTML
- CSS
- JavaScript
- Browser `localStorage`
- No framework / no backend / no API key

## Run locally

Clone the repository and open `index.html` directly, or run a tiny static server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Current status

MVP. The core session loop works in-browser. Planned follow-ups include PDF text parsing, export, better session recovery, and lightweight review filters.

## Privacy

By default, reading material and session history stay in the current browser. The app does not upload content or send automatic messages.

---

Built as a rapid product prototype with an emphasis on a small complete loop rather than a large feature surface.
