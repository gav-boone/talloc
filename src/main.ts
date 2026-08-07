import { renderLogView } from './views/log';
import { renderCategoriesView } from './views/categories';
import { renderBudgetsView } from './views/budgets';
import { renderGoalsView } from './views/goals';
import { renderBalanceView } from './views/balance';

type ViewName = 'log' | 'categories' | 'budgets' | 'goals' | 'balance';

const views: Record<ViewName, (container: HTMLElement) => void> = {
  log: renderLogView,
  categories: renderCategoriesView,
  budgets: renderBudgetsView,
  goals: renderGoalsView,
  balance: renderBalanceView,
};

let currentView: ViewName = 'log';

function navigateTo(view: ViewName): void {
  currentView = view;
  const container = document.getElementById('view-container')!;
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.view === view);
  });

  // Render selected view
  views[view](container);

  // Update URL hash
  window.location.hash = view;
}

function init(): void {
  // Set initial view from hash
  const hash = window.location.hash.slice(1) as ViewName;
  if (hash && hash in views) {
    currentView = hash;
  }

  // Bind nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = (btn as HTMLElement).dataset.view as ViewName;
      navigateTo(view);
    });
  });

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) as ViewName;
    if (hash && hash in views) {
      navigateTo(hash);
    }
  });

  navigateTo(currentView);
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/talloc/sw.js').catch(() => {
    // SW registration failed — app still works without it
  });
}

init();
