# Talloc

> Track time like money.

Talloc is a personal time-tracking app that treats every 15 minutes as a "transaction." Log how you spend your time, set budgets for your ideal day, and track daily/weekly goals — all stored locally on your device.

## Philosophy

Just like a bank account, you have a finite balance of time each day. Talloc helps you see where it goes:

- **Transactions** — Log time in 15-min blocks to user-defined categories
- **Budgets** — Define your ideal day (how you *want* to spend time)
- **Goals** — Set daily/weekly targets (min/max per category)
- **Balance** — See the gap between intention and reality

## Platform

Talloc is a **Progressive Web App (PWA)** hosted on GitHub Pages. It works on any device with a modern browser.

| Platform | How to use |
|----------|-----------|
| **iPhone** | Open in Safari → "Add to Home Screen" → runs like a native app |
| **Android** | Open in Chrome → "Install app" prompt |
| **Desktop** | Open in any browser, or install as a desktop app via Chrome/Edge |

**Live app:** [https://gav-boone.github.io/talloc/](https://gav-boone.github.io/talloc/)

### PWA Features
- Fullscreen (no browser chrome) when launched from home screen
- Offline support — works without internet after first load
- Local data storage — all data stays on your device
- Auto-updates on next visit when new code is deployed

## Tech Stack

- **Flutter** — UI framework (compiled to web)
- **Dart** — application language
- **Hive** — local storage (browser IndexedDB)
- **Riverpod** — state management
- **GitHub Pages** — free static hosting

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.x+)

### Run locally

```bash
# Clone the repo
git clone https://github.com/gav-boone/talloc.git
cd talloc

# Get dependencies
flutter pub get

# Run in Chrome
flutter run -d chrome
```

### Deploy

```bash
# Build for web
flutter build web --release --base-href "/talloc/"

# Deploy to GitHub Pages (pushes to gh-pages branch)
# See IMPLEMENTATION_GUIDE.md for full deployment steps
```

## Project Status

🚧 **In development** — Learning project for Flutter/web development.

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for the full build plan.

## License

Personal project. All rights reserved.
