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
1. **iPhone** — primary interface, mobile-first design
2. **Windows desktop** — secondary, useful for review/planning
3. **Linux Mint** — stretch goal, same codebase

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Flutter 3.x | Cross-platform from one codebase |
| Language | Dart | Required by Flutter; similar to JS/TypeScript |
| Local DB | Isar | Fast, local NoSQL database with great Flutter support |
| State Mgmt | Riverpod | Modern, testable, good for learning |
| Navigation | GoRouter | Declarative routing, deep-link ready |
| Testing | flutter_test + integration_test | Built-in |

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
# Create project
flutter create --org com.yourname talloc

# Run on current platform
flutter run

# Run on specific device
flutter devices          # list available
flutter run -d windows
flutter run -d <iphone-id>

# Add dependencies
flutter pub add isar
flutter pub add riverpod
flutter pub add go_router

# Run tests
flutter test

# Build for release
flutter build ios
flutter build windows
```

---

## Next Steps

1. ✅ Read this guide
2. Verify git + GitHub CLI are working
3. Create the Flutter project
4. Push initial commit to GitHub
5. Start Phase 1 implementation
