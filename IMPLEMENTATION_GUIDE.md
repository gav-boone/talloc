# Talloc – Implementation Guide

> **Philosophy:** Track time like money. Every 15 minutes is a unit you spend, save, or invest.

## Overview

**Talloc** is a personal time-tracking app built with Flutter. It targets iPhone (primary), Windows desktop, and Linux (optional). All data is stored locally on-device.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Transaction** | A single time entry — a block of 15 min assigned to a category |
| **Category** | User-defined labels (e.g., "Deep Work", "Exercise", "Scrolling") |
| **Budget** | An ideal calendar — how you *want* to spend your time |
| **Goal** | Daily/weekly targets per category (e.g., "≥2h Deep Work/day") |
| **Balance** | Difference between budgeted time and actual time spent |

### Target Platforms (priority order)
1. **Web PWA (iPhone via Safari)** — primary interface, mobile-first design
2. **Web PWA (Android via Chrome)** — same build, automatic
3. **Web PWA (Desktop browser)** — same build, responsive layout

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Flutter 3.x (web) | Cross-platform, compiles to JS for browser |
| Language | Dart | Required by Flutter; similar to JS/TypeScript |
| Local DB | Hive | Lightweight, works in browser via IndexedDB |
| State Mgmt | Riverpod | Modern, testable, good for learning |
| Hosting | GitHub Pages | Free static hosting, auto-deploy via Actions |
| Testing | flutter_test | Built-in |

---

## Data Model

```dart
// Category — user-defined time buckets
class Category {
  String id;
  String name;
  String emoji;       // visual identifier
  Color color;
  bool isArchived;
}

// Transaction — a single time block
class Transaction {
  String id;
  DateTime startTime;
  int blocks;          // number of 15-min blocks (1 block = 15 min)
  String categoryId;
  String? note;
}

// Budget — ideal time allocation
class Budget {
  String id;
  String name;         // e.g., "Weekday", "Weekend"
  Map<String, int> allocations; // categoryId → blocks per day
}

// Goal — targets to hit
class Goal {
  String id;
  String categoryId;
  int targetBlocks;
  GoalPeriod period;   // daily | weekly
  GoalType type;       // atLeast | atMost | exactly
}
```

---

## Architecture

```
lib/
├── main.dart                  # App entry point
├── app.dart                   # MaterialApp + theme + router
├── core/
│   ├── constants.dart         # Block duration, colors, etc.
│   ├── theme.dart             # App-wide theming
│   └── utils.dart             # Helpers (time formatting, etc.)
├── models/                    # Data classes
│   ├── category.dart
│   ├── transaction.dart
│   ├── budget.dart
│   └── goal.dart
├── repositories/              # Data access layer (Isar)
│   ├── category_repository.dart
│   ├── transaction_repository.dart
│   ├── budget_repository.dart
│   └── goal_repository.dart
├── providers/                 # Riverpod providers
│   ├── category_providers.dart
│   ├── transaction_providers.dart
│   ├── budget_providers.dart
│   └── goal_providers.dart
├── screens/                   # Full-page views
│   ├── home/
│   ├── log_time/
│   ├── categories/
│   ├── budget/
│   ├── goals/
│   └── stats/
└── widgets/                   # Reusable components
    ├── block_grid.dart
    ├── category_chip.dart
    ├── time_picker.dart
    └── progress_ring.dart
```

---

## Hosting & Deployment

### Strategy: PWA on GitHub Pages

Talloc runs as a **Progressive Web App** hosted on GitHub Pages. This gives us a free, instantly-accessible app on any device — including iPhone — without needing a Mac, Xcode, or an Apple Developer account.

**How it works:**
1. Flutter compiles to HTML/CSS/JS (`flutter build web`)
2. Built files are deployed to GitHub Pages (via `gh-pages` branch or GitHub Actions)
3. On iPhone: open the URL in Safari → "Add to Home Screen" → app icon appears
4. The app runs fullscreen, works offline, and stores data locally in the browser

**What the user gets:**
- Home screen icon, fullscreen experience (no browser chrome)
- Offline support via service worker caching
- Local data persistence via IndexedDB
- Automatic updates on next visit when new code is deployed

**Limitations (acceptable for this app):**
- No push notifications on iOS
- No native widgets/Siri/background processing
- Storage *theoretically* clearable by iOS under extreme low-space conditions (rare)
- Animations ~95% as smooth as native

### Deployment Steps

```bash
# Build the web app
flutter build web --release --base-href "/talloc/"

# Deploy to GitHub Pages (using gh-pages branch)
# Option A: Manual
cd build/web
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/gav-boone/talloc.git
git push -f origin main:gh-pages

# Option B: GitHub Actions (automate on push to main)
# See .github/workflows/deploy.yml
```

### PWA Configuration

Key files:
- `web/manifest.json` — app name, icons, theme color, display mode
- `web/index.html` — service worker registration
- `web/flutter_service_worker.js` — auto-generated by Flutter build

### GitHub Pages URL

Once deployed: `https://gav-boone.github.io/talloc/`

---

## Implementation Phases

### Phase 1: Foundation (You are here)
**Goal:** App runs, displays a screen, data layer works.

- [ ] Create Flutter project
- [ ] Set up folder structure
- [ ] Add dependencies (Isar, Riverpod, GoRouter)
- [ ] Create data models
- [ ] Build repository layer with Isar
- [ ] Create a basic home screen (scaffold only)
- [ ] Verify it runs on Windows + iOS simulator

**Key learnings:** Flutter project structure, widgets, Dart syntax, hot reload

---

### Phase 2: Categories & Logging
**Goal:** User can create categories and log time transactions.

- [ ] Category management screen (CRUD)
- [ ] "Log Time" screen — pick category, set # of blocks, optional note
- [ ] Today's timeline view on home screen
- [ ] Pull-to-refresh, basic animations

**Key learnings:** Forms, state management, lists, user input

---

### Phase 3: Budget & Goals
**Goal:** User can define ideal day and set targets.

- [ ] Budget editor — allocate blocks per category per day template
- [ ] Goal creation — daily/weekly, min/max targets
- [ ] Home screen shows budget vs. actual (balance)
- [ ] Visual indicators (over/under budget)

**Key learnings:** Complex state, computed values, conditional UI

---

### Phase 4: Stats & Insights
**Goal:** User can see trends and reflect on time use.

- [ ] Daily/weekly/monthly summary views
- [ ] Charts (bar chart for category breakdown, line for trends)
- [ ] Streak tracking for goals
- [ ] Export to CSV

**Key learnings:** Data visualization, date handling, file I/O

---

### Phase 5: Polish & Platform Tuning
**Goal:** App feels native and delightful on each platform.

- [ ] iOS: Cupertino-style touches, haptics, safe areas
- [ ] Windows: Responsive layout for larger screens
- [ ] Notifications/reminders (optional)
- [ ] Onboarding flow for first-time users
- [ ] Dark/light theme
- [ ] App icon & splash screen

**Key learnings:** Platform-specific code, adaptive layouts, publishing

---

## Quick Dart Primer (for web devs)

| JavaScript/TypeScript | Dart |
|----------------------|------|
| `const x = 5` | `final x = 5;` (runtime) or `const x = 5;` (compile-time) |
| `let x = 5` | `var x = 5;` |
| `() => {}` | `() {}` or `() => expr` |
| `async/await` | Same! `async/await` works identically |
| `interface` | No keyword — use `abstract class` or `abstract interface class` |
| `null?.prop` | Same! `null?.prop` |
| `??` | Same! `??` |
| `Array` | `List` |
| `Object/Map` | `Map<K, V>` |
| `import x from 'y'` | `import 'package:y/y.dart';` |

---

## Commands Reference

```bash
# Run locally in Chrome
flutter run -d chrome

# Add dependencies
flutter pub add hive
flutter pub add hive_flutter
flutter pub add flutter_riverpod

# Run tests
flutter test

# Build for web (production)
flutter build web --release --base-href "/talloc/"

# Deploy to GitHub Pages
# See "Hosting & Deployment" section above
```

---

## Next Steps

1. ✅ Read this guide
2. Verify git + GitHub CLI are working
3. Create the Flutter project
4. Push initial commit to GitHub
5. Start Phase 1 implementation
