# Talloc

> Track time like money.

Talloc is a personal time-tracking app that treats every 15 minutes as a "transaction." Log how you spend your time, set budgets for your ideal day, and track daily/weekly goals — all stored locally on your device.

## Philosophy

Just like a bank account, you have a finite balance of time each day. Talloc helps you see where it goes:

- **Transactions** — Log time in 15-min blocks to user-defined categories
- **Budgets** — Define your ideal day (how you *want* to spend time)
- **Goals** — Set daily/weekly targets (min/max per category)
- **Balance** — See the gap between intention and reality

## Platforms

| Platform | Status |
|----------|--------|
| iPhone | Primary target |
| Windows desktop | Secondary |
| Linux Mint | Stretch goal |

## Tech Stack

- **Flutter** — cross-platform UI framework
- **Dart** — application language
- **Isar** — local NoSQL database
- **Riverpod** — state management
- **GoRouter** — navigation/routing

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.x+)
- For iOS: Xcode + CocoaPods (macOS required)
- For Windows: Visual Studio with C++ desktop workload
- For Linux: Standard Flutter Linux dependencies

### Run locally

```bash
# Clone the repo
git clone https://github.com/gav-boone/talloc.git
cd talloc

# Get dependencies
flutter pub get

# Run
flutter run
```

## Project Status

🚧 **In development** — Learning project for Flutter/mobile development.

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for the full build plan.

## License

Personal project. All rights reserved.
