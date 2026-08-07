import { getTransactions, getCategories, getBudgets } from '../storage';
import { formatBlocks, todayISO, colorFromValue, escapeHtml } from '../utils';

export function renderBalanceView(container: HTMLElement): void {
  const categories = getCategories();
  const budgets = getBudgets();
  const transactions = getTransactions();
  const today = todayISO();
  const catMap = new Map(categories.map(c => [c.id, c]));
  const budgetMap = new Map(budgets.map(b => [b.categoryId, b]));

  const todayTxs = transactions.filter(tx => tx.startTime.slice(0, 10) === today);
  const totalLogged = todayTxs.reduce((sum, tx) => sum + tx.blocks, 0);
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.blocksPerDay, 0);

  // Group today's time by category
  const byCategory = new Map<string, number>();
  todayTxs.forEach(tx => {
    byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) || 0) + tx.blocks);
  });

  container.innerHTML = `
    <section class="view-section">
      <h1>Balance</h1>
      <p class="subtitle">See the gap between intention and reality</p>
      
      <div class="balance-summary">
        <div class="balance-stat">
          <span class="stat-value">${formatBlocks(totalLogged)}</span>
          <span class="stat-label">Logged today</span>
        </div>
        <div class="balance-stat">
          <span class="stat-value">${formatBlocks(totalBudgeted)}</span>
          <span class="stat-label">Budgeted</span>
        </div>
        <div class="balance-stat">
          <span class="stat-value">${formatBlocks(96 - totalLogged)}</span>
          <span class="stat-label">Remaining</span>
        </div>
      </div>

      <h2>Budget vs. Actual</h2>
      ${budgets.length === 0 && todayTxs.length === 0 ? '<p class="hint">Set budgets and log time to see your balance.</p>' : `
      <ul class="balance-list">
        ${Array.from(new Set([...budgets.map(b => b.categoryId), ...byCategory.keys()])).map(catId => {
          const cat = catMap.get(catId);
          const color = cat ? colorFromValue(cat.colorValue) : '#888';
          const name = cat ? escapeHtml(cat.name) : 'Unknown';
          const budgeted = budgetMap.get(catId)?.blocksPerDay || 0;
          const actual = byCategory.get(catId) || 0;
          const diff = actual - budgeted;
          const diffClass = diff > 0 ? 'over' : diff < 0 ? 'under' : 'even';
          const diffLabel = diff === 0 ? 'On track' : diff > 0 ? `+${formatBlocks(diff)} over` : `${formatBlocks(Math.abs(diff))} under`;

          return `
            <li class="balance-item">
              <span class="cat-dot" style="background:${color}"></span>
              <span class="balance-name">${name}</span>
              <span class="balance-budgeted">${formatBlocks(budgeted)}</span>
              <span class="balance-actual">${formatBlocks(actual)}</span>
              <span class="balance-diff ${diffClass}">${diffLabel}</span>
            </li>
          `;
        }).join('')}
      </ul>
      `}
    </section>
  `;
}
