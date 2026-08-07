import { TimeTransaction } from '../models';
import { getTransactions, addTransaction, deleteTransaction, getCategories } from '../storage';
import { generateId, formatBlocks, todayISO, colorFromValue, escapeHtml } from '../utils';

export function renderLogView(container: HTMLElement): void {
  const categories = getCategories();

  container.innerHTML = `
    <section class="view-section">
      <h1>Log Time</h1>
      ${categories.length === 0 ? '<p class="hint">Add categories first to start logging time.</p>' : `
      <form id="log-form" class="form-card">
        <div class="form-group">
          <label for="log-category">Category</label>
          <select id="log-category" required>
            <option value="">Select category...</option>
            ${categories.filter(c => !c.isArchived).map(c =>
              `<option value="${c.id}">${escapeHtml(c.name)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="log-blocks">Blocks (15 min each)</label>
          <input type="number" id="log-blocks" min="1" max="96" value="1" required />
        </div>
        <div class="form-group">
          <label for="log-date">Date</label>
          <input type="date" id="log-date" value="${todayISO()}" required />
        </div>
        <div class="form-group">
          <label for="log-note">Note (optional)</label>
          <input type="text" id="log-note" placeholder="What were you doing?" />
        </div>
        <button type="submit" class="btn btn-primary">Log Time</button>
      </form>
      `}
      <h2>Today's Log</h2>
      <div id="log-list"></div>
    </section>
  `;

  renderTransactionList(container);

  const form = container.querySelector('#log-form') as HTMLFormElement | null;
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const categoryId = (document.getElementById('log-category') as HTMLSelectElement).value;
      const blocks = parseInt((document.getElementById('log-blocks') as HTMLInputElement).value);
      const date = (document.getElementById('log-date') as HTMLInputElement).value;
      const note = (document.getElementById('log-note') as HTMLInputElement).value || undefined;

      const tx: TimeTransaction = {
        id: generateId(),
        startTime: new Date(date).toISOString(),
        blocks,
        categoryId,
        note,
      };

      addTransaction(tx);
      renderLogView(container);
    });
  }
}

function renderTransactionList(container: HTMLElement): void {
  const list = container.querySelector('#log-list') as HTMLElement;
  const today = todayISO();
  const categories = getCategories();
  const catMap = new Map(categories.map(c => [c.id, c]));

  const todayTxs = getTransactions().filter(tx =>
    tx.startTime.slice(0, 10) === today
  ).sort((a, b) => b.startTime.localeCompare(a.startTime));

  if (todayTxs.length === 0) {
    list.innerHTML = '<p class="hint">No time logged today.</p>';
    return;
  }

  const totalBlocks = todayTxs.reduce((sum, tx) => sum + tx.blocks, 0);

  list.innerHTML = `
    <p class="summary">Total today: <strong>${formatBlocks(totalBlocks)}</strong> (${totalBlocks} blocks)</p>
    <ul class="transaction-list">
      ${todayTxs.map(tx => {
        const cat = catMap.get(tx.categoryId);
        const color = cat ? colorFromValue(cat.colorValue) : '#888';
        const name = cat ? escapeHtml(cat.name) : 'Unknown';
        return `
          <li class="transaction-item">
            <span class="cat-dot" style="background:${color}"></span>
            <span class="tx-name">${name}</span>
            <span class="tx-blocks">${formatBlocks(tx.blocks)}</span>
            ${tx.note ? `<span class="tx-note">${escapeHtml(tx.note)}</span>` : ''}
            <button class="btn-icon btn-delete" data-id="${tx.id}" aria-label="Delete transaction">×</button>
          </li>
        `;
      }).join('')}
    </ul>
  `;

  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      deleteTransaction(id);
      renderLogView(container);
    });
  });
}
