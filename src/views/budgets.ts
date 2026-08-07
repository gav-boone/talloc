import { Budget } from '../models';
import { getBudgets, addBudget, updateBudget, deleteBudget, getCategories } from '../storage';
import { generateId, formatBlocks, colorFromValue, escapeHtml } from '../utils';

export function renderBudgetsView(container: HTMLElement): void {
  const categories = getCategories().filter(c => !c.isArchived);
  const budgets = getBudgets();
  const catMap = new Map(categories.map(c => [c.id, c]));
  const budgetedCatIds = new Set(budgets.map(b => b.categoryId));
  const availableCategories = categories.filter(c => !budgetedCatIds.has(c.id));

  const totalBlocks = budgets.reduce((sum, b) => sum + b.blocksPerDay, 0);

  container.innerHTML = `
    <section class="view-section">
      <h1>Budgets</h1>
      <p class="subtitle">Design your ideal day (96 blocks = 24 hours)</p>
      ${availableCategories.length > 0 ? `
      <form id="budget-form" class="form-card">
        <div class="form-group">
          <label for="budget-category">Category</label>
          <select id="budget-category" required>
            <option value="">Select category...</option>
            ${availableCategories.map(c =>
              `<option value="${c.id}">${escapeHtml(c.name)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="budget-blocks">Blocks per day</label>
          <input type="number" id="budget-blocks" min="1" max="96" value="4" required />
          <span class="form-hint" id="budget-time-hint">= 1h 0m</span>
        </div>
        <button type="submit" class="btn btn-primary">Add Budget</button>
      </form>
      ` : categories.length === 0 ? '<p class="hint">Add categories first.</p>' : '<p class="hint">All categories have budgets.</p>'}
      
      <h2>Daily Budget <span class="summary-inline">${formatBlocks(totalBlocks)} / 24h (${totalBlocks}/96 blocks)</span></h2>
      <div class="budget-bar">
        ${budgets.map(b => {
          const cat = catMap.get(b.categoryId);
          const color = cat ? colorFromValue(cat.colorValue) : '#888';
          const pct = (b.blocksPerDay / 96) * 100;
          return `<div class="budget-segment" style="width:${pct}%;background:${color}" title="${cat ? escapeHtml(cat.name) : 'Unknown'}: ${formatBlocks(b.blocksPerDay)}"></div>`;
        }).join('')}
        ${totalBlocks < 96 ? `<div class="budget-segment budget-empty" style="width:${((96 - totalBlocks) / 96) * 100}%" title="Unallocated: ${formatBlocks(96 - totalBlocks)}"></div>` : ''}
      </div>
      <ul class="budget-list">
        ${budgets.map(b => {
          const cat = catMap.get(b.categoryId);
          const color = cat ? colorFromValue(cat.colorValue) : '#888';
          const name = cat ? escapeHtml(cat.name) : 'Unknown';
          return `
            <li class="budget-item">
              <span class="cat-dot" style="background:${color}"></span>
              <span class="budget-name">${name}</span>
              <span class="budget-blocks">${formatBlocks(b.blocksPerDay)}</span>
              <button class="btn-icon btn-delete" data-id="${b.id}" aria-label="Remove budget">×</button>
            </li>
          `;
        }).join('')}
      </ul>
      ${budgets.length === 0 ? '<p class="hint">No budgets set. Add one above to design your ideal day.</p>' : ''}
    </section>
  `;

  // Update time hint on blocks input change
  const blocksInput = container.querySelector('#budget-blocks') as HTMLInputElement | null;
  const hint = container.querySelector('#budget-time-hint') as HTMLElement | null;
  if (blocksInput && hint) {
    blocksInput.addEventListener('input', () => {
      const val = parseInt(blocksInput.value) || 0;
      hint.textContent = `= ${formatBlocks(val)}`;
    });
  }

  const form = container.querySelector('#budget-form') as HTMLFormElement | null;
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const categoryId = (document.getElementById('budget-category') as HTMLSelectElement).value;
      const blocksPerDay = parseInt((document.getElementById('budget-blocks') as HTMLInputElement).value);
      if (!categoryId) return;

      const budget: Budget = {
        id: generateId(),
        categoryId,
        blocksPerDay,
      };
      addBudget(budget);
      renderBudgetsView(container);
    });
  }

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      deleteBudget(id);
      renderBudgetsView(container);
    });
  });
}
