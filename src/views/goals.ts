import { Goal } from '../models';
import { getGoals, addGoal, deleteGoal, getCategories, getTransactions } from '../storage';
import { generateId, formatBlocks, todayISO, startOfWeekISO, colorFromValue, escapeHtml } from '../utils';

export function renderGoalsView(container: HTMLElement): void {
  const categories = getCategories().filter(c => !c.isArchived);
  const goals = getGoals();
  const catMap = new Map(categories.map(c => [c.id, c]));
  const transactions = getTransactions();
  const today = todayISO();
  const weekStart = startOfWeekISO();

  container.innerHTML = `
    <section class="view-section">
      <h1>Goals</h1>
      ${categories.length === 0 ? '<p class="hint">Add categories first.</p>' : `
      <form id="goal-form" class="form-card">
        <div class="form-group">
          <label for="goal-category">Category</label>
          <select id="goal-category" required>
            <option value="">Select category...</option>
            ${categories.map(c =>
              `<option value="${c.id}">${escapeHtml(c.name)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="goal-type">Type</label>
            <select id="goal-type">
              <option value="atLeast">At least</option>
              <option value="atMost">At most</option>
              <option value="exactly">Exactly</option>
            </select>
          </div>
          <div class="form-group">
            <label for="goal-blocks">Blocks</label>
            <input type="number" id="goal-blocks" min="1" max="96" value="4" required />
          </div>
          <div class="form-group">
            <label for="goal-period">Period</label>
            <select id="goal-period">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Goal</button>
      </form>
      `}
      <h2>Active Goals</h2>
      <ul class="goals-list">
        ${goals.map(goal => {
          const cat = catMap.get(goal.categoryId);
          const color = cat ? colorFromValue(cat.colorValue) : '#888';
          const name = cat ? escapeHtml(cat.name) : 'Unknown';
          
          const relevantTxs = transactions.filter(tx => {
            if (tx.categoryId !== goal.categoryId) return false;
            const txDate = tx.startTime.slice(0, 10);
            return goal.period === 'daily' ? txDate === today : txDate >= weekStart;
          });
          const actual = relevantTxs.reduce((sum, tx) => sum + tx.blocks, 0);
          const target = goal.targetBlocks;
          const pct = Math.min((actual / target) * 100, 100);
          const status = getGoalStatus(goal, actual);

          return `
            <li class="goal-item">
              <div class="goal-header">
                <span class="cat-dot" style="background:${color}"></span>
                <span class="goal-name">${name}</span>
                <span class="goal-target">${goal.type === 'atLeast' ? '≥' : goal.type === 'atMost' ? '≤' : '='} ${formatBlocks(target)} / ${goal.period}</span>
                <span class="goal-status ${status}">${status}</span>
                <button class="btn-icon btn-delete" data-id="${goal.id}" aria-label="Delete goal">×</button>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${status}" style="width:${pct}%"></div>
              </div>
              <span class="progress-label">${formatBlocks(actual)} / ${formatBlocks(target)}</span>
            </li>
          `;
        }).join('')}
      </ul>
      ${goals.length === 0 ? '<p class="hint">No goals set. Add one above!</p>' : ''}
    </section>
  `;

  const form = container.querySelector('#goal-form') as HTMLFormElement | null;
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const categoryId = (document.getElementById('goal-category') as HTMLSelectElement).value;
      const type = (document.getElementById('goal-type') as HTMLSelectElement).value as Goal['type'];
      const targetBlocks = parseInt((document.getElementById('goal-blocks') as HTMLInputElement).value);
      const period = (document.getElementById('goal-period') as HTMLSelectElement).value as Goal['period'];
      if (!categoryId) return;

      const goal: Goal = { id: generateId(), categoryId, targetBlocks, period, type };
      addGoal(goal);
      renderGoalsView(container);
    });
  }

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      deleteGoal(id);
      renderGoalsView(container);
    });
  });
}

function getGoalStatus(goal: Goal, actual: number): string {
  const { type, targetBlocks } = goal;
  if (type === 'atLeast') return actual >= targetBlocks ? 'met' : 'pending';
  if (type === 'atMost') return actual <= targetBlocks ? 'met' : 'exceeded';
  // exactly
  return actual === targetBlocks ? 'met' : actual < targetBlocks ? 'pending' : 'exceeded';
}
