import { Budget, TimeTransaction } from '../models';
import { getTransactions, getTags, getBudgets } from '../storage';
import { formatDuration, todayISO, colorFromValue, escapeHtml, timeToMinutes } from '../utils';

/** Compute minutes per tag for a list of time-sorted entries */
function computeTagMinutes(entries: { endTime: string; tags: string[] }[]): Map<string, number> {
  const sorted = [...entries].sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
  const byTag = new Map<string, number>();
  let prevEnd = '00:00';
  for (const entry of sorted) {
    const mins = timeToMinutes(entry.endTime) - timeToMinutes(prevEnd);
    if (mins > 0) {
      for (const tagId of entry.tags) {
        byTag.set(tagId, (byTag.get(tagId) || 0) + mins);
      }
    }
    prevEnd = entry.endTime;
  }
  return byTag;
}

function getTodayDayIndex(): number {
  // JS: 0=Sun, 1=Mon... We use 0=Mon, 6=Sun
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function renderBalanceView(container: HTMLElement): void {
  const tags = getTags();
  const budgets = getBudgets();
  const transactions = getTransactions();
  const today = todayISO();
  const tagMap = new Map(tags.map(t => [t.id, t]));
  const todayDayIndex = getTodayDayIndex();

  // Today's actual log
  const todayTxs = transactions.filter(tx => tx.date === today);
  const actualByTag = computeTagMinutes(todayTxs);
  const sortedTxs = [...todayTxs].sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
  const totalLoggedMins = sortedTxs.length > 0 ? timeToMinutes(sortedTxs[sortedTxs.length - 1].endTime) : 0;

  // Today's planned schedule
  const todayBudgets = budgets.filter(b => b.day === todayDayIndex);
  const plannedByTag = computeTagMinutes(todayBudgets);
  const sortedBudgets = [...todayBudgets].sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
  const totalPlannedMins = sortedBudgets.length > 0 ? timeToMinutes(sortedBudgets[sortedBudgets.length - 1].endTime) : 0;

  // All tags that appear in either actual or planned
  const allTagIds = new Set([...actualByTag.keys(), ...plannedByTag.keys()]);

  container.innerHTML = `
    <section class="view-section">
      <h1>Balance</h1>
      <p class="subtitle">Schedule vs. reality for today</p>
      
      <div class="balance-summary">
        <div class="balance-stat">
          <span class="stat-value">${formatDuration(totalLoggedMins)}</span>
          <span class="stat-label">Logged</span>
        </div>
        <div class="balance-stat">
          <span class="stat-value">${formatDuration(totalPlannedMins)}</span>
          <span class="stat-label">Planned</span>
        </div>
        <div class="balance-stat">
          <span class="stat-value">${formatDuration(24 * 60 - totalLoggedMins)}</span>
          <span class="stat-label">Remaining</span>
        </div>
      </div>

      <h2>Planned vs. Actual</h2>
      ${allTagIds.size === 0 ? '<p class="hint">Set up a weekly schedule and log time to see your balance.</p>' : `
      <ul class="balance-list">
        ${Array.from(allTagIds).map(tagId => {
          const tag = tagMap.get(tagId);
          const color = tag ? colorFromValue(tag.colorValue) : '#888';
          const name = tag ? escapeHtml(tag.name) : 'Unknown';
          const plannedMins = plannedByTag.get(tagId) || 0;
          const actualMins = actualByTag.get(tagId) || 0;
          const diffMins = actualMins - plannedMins;
          const diffClass = diffMins > 0 ? 'over' : diffMins < 0 ? 'under' : 'even';
          const diffLabel = diffMins === 0 ? 'On track' : diffMins > 0 ? `+${formatDuration(diffMins)} over` : `${formatDuration(Math.abs(diffMins))} under`;

          return `
            <li class="balance-item">
              <span class="cat-dot" style="background:${color}"></span>
              <span class="balance-name">${name}</span>
              <span class="balance-budgeted">${formatDuration(plannedMins)}</span>
              <span class="balance-actual">${formatDuration(actualMins)}</span>
              <span class="balance-diff ${diffClass}">${diffLabel}</span>
            </li>
          `;
        }).join('')}
      </ul>
      `}
    </section>
  `;
}
