# Talloc

> Track time like money.

Talloc is a personal time-tracking app that treats every 15 minutes as a "transaction." Log how you spend your time, set budgets for your ideal day, and track daily/weekly goals — all stored locally on your device.

## Philosophy

Just like a bank account, you have a finite balance of time each day. Talloc helps you see where it goes:

- **Transactions** — Log time in 15-min blocks to user-defined categories
- **Budgets** — Define your ideal day (how you *want* to spend time)
- **Goals** — Set daily/weekly targets (min/max per category)
- **Balance** — See the gap between intention and reality

## Tech Stack

- **TypeScript** — application language
- **Vite** — build tool and dev server
- **localStorage** — client-side persistence
- **PWA** — installable, offline-capable
- **GitHub Pages** — free static hosting

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (18+)

### Run locally

```bash
npm install
npm run dev
```

### Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Platform

Talloc is a **Progressive Web App (PWA)** hosted on GitHub Pages.

| Platform | How to use |
|----------|-----------|
| **iPhone** | Open in Safari → "Add to Home Screen" |
| **Android** | Open in Chrome → "Install app" prompt |
| **Desktop** | Open in any browser, or install via Chrome/Edge |

## License

Personal project. All rights reserved.
