import { Budget, TimeTransaction } from '../models';
import { getTransactions, getTags, getBudgets } from '../storage';
import { formatDuration, todayISO, colorFromValue, escapeHtml, timeToMinutes } from '../utils';

let viewingDate: string = todayISO();
let viewingWeekStart: string = getMonday(todayISO());
let balanceMode: 'day' | 'week' = 'day';

function getMonday(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function getDayIndex(dateISO: string): number {
  const jsDay = new Date(dateISO + 'T12:00:00').getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const today = todayISO();
  if (iso === today) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatWeekLabel(startISO: string): string {
  const start = new Date(startISO + 'T12:00:00');
  const end = new Date(startISO + 'T12:00:00');
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.getDate()}`;
  }
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function shiftDate(days: number): void {
  const d = new Date(viewingDate + 'T12:00:00');
  d.setDate(d.getDate() + days);
  viewingDate = d.toISOString().slice(0, 10);
}

function shiftWeek(weeks: number): void {
  const d = new Date(viewingWeekStart + 'T12:00:00');
  d.setDate(d.getDate() + weeks * 7);
  viewingWeekStart = d.toISOString().slice(0, 10);
}

function getWeekDates(startISO: string): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startISO + 'T12:00:00');
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function computeTagMinutesForDay(entries: { endTime: string; tags: string[] }[]): Map<string, number> {
  const sorted = [...entries].sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
  const byTag = new Map<string, number>();
  let prevEnd = '00:00';
  for (const entry of sorted) {
    const mins = timeToMinutes(entry.endTime) - timeToMinutes(prevEnd);
    if (mins > 0 && entry.tags.length > 0) {
      // Split evenly in 15-min chunks, first tag gets remainder
      const blocks = Math.round(mins / 15);
      const perTag = Math.floor(blocks / entry.tags.length);
      const remainder = blocks - perTag * entry.tags.length;
      for (let i = 0; i < entry.tags.length; i++) {
        const tagBlocks = perTag + (i < remainder ? 1 : 0);
        byTag.set(entry.tags[i], (byTag.get(entry.tags[i]) || 0) + tagBlocks * 15);
      }
    }
    prevEnd = entry.endTime;
  }
  return byTag;
}

function getTotalLoggedForDay(txs: TimeTransaction[]): number {
  if (txs.length === 0) return 0;
  const sorted = [...txs].sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
  return timeToMinutes(sorted[sorted.length - 1].endTime);
}

export function renderBalanceView(container: HTMLElement): void {
  const tags = getTags();
  const budgets = getBudgets();
  const transactions = getTransactions();
  const tagMap = new Map(tags.map(t => [t.id, t]));
  const today = todayISO();

  // Current time rounded down to nearest 15-min block
  const now = new Date();
  const currentMins = Math.floor((now.getHours() * 60 + now.getMinutes()) / 15) * 15;

  // === DAY ===
  const dayIndex = getDayIndex(viewingDate);
  const dayTxs = transactions.filter(tx => tx.date === viewingDate);
  const actualByTagDay = computeTagMinutesForDay(dayTxs);
  const totalLoggedDay = getTotalLoggedForDay(dayTxs);

  // For planned: if viewing today, only count budgets up to current time
  const isToday = viewingDate === today;
  const dayBudgetsAll = budgets.filter(b => b.day === dayIndex);
  const dayBudgetsCapped = isToday
    ? dayBudgetsAll.filter(b => timeToMinutes(b.endTime) <= currentMins)
    : dayBudgetsAll;
  const plannedByTagDay = computeTagMinutesForDay(dayBudgetsCapped);
  const sortedDayBudgets = [...dayBudgetsCapped].sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
  const totalPlannedDay = sortedDayBudgets.length > 0 ? timeToMinutes(sortedDayBudgets[sortedDayBudgets.length - 1].endTime) : 0;
  // Include tags that have either actual or planned time (use full schedule for tag list)
  const fullPlannedByTagDay = computeTagMinutesForDay(dayBudgetsAll);
  const allTagIdsDay = new Set([...actualByTagDay.keys(), ...plannedByTagDay.keys(), ...fullPlannedByTagDay.keys()]);

  // === WEEK ===
  const weekDates = getWeekDates(viewingWeekStart);
  const currentWeekStart = getMonday(today);
  const isCurrentWeek = viewingWeekStart === currentWeekStart;
  let totalLoggedWeek = 0;
  let totalPlannedWeek = 0;
  const actualByTagWeek = new Map<string, number>();
  const plannedByTagWeek = new Map<string, number>();

  for (let i = 0; i < 7; i++) {
    const date = weekDates[i];
    const wTxs = transactions.filter(tx => tx.date === date);
    totalLoggedWeek += getTotalLoggedForDay(wTxs);
    const dayActual = computeTagMinutesForDay(wTxs);
    for (const [tagId, mins] of dayActual) {
      actualByTagWeek.set(tagId, (actualByTagWeek.get(tagId) || 0) + mins);
    }

    // For planned: if current week, only count full past days + today capped at current time
    const wBudgetsAll = budgets.filter(b => b.day === i);
    let wBudgetsCapped: typeof wBudgetsAll;
    if (isCurrentWeek) {
      if (date < today) {
        // Past day — count all planned
        wBudgetsCapped = wBudgetsAll;
      } else if (date === today) {
        // Today — cap at current time
        wBudgetsCapped = wBudgetsAll.filter(b => timeToMinutes(b.endTime) <= currentMins);
      } else {
        // Future day — don't count
        wBudgetsCapped = [];
      }
    } else {
      wBudgetsCapped = wBudgetsAll;
    }

    const dayPlanned = computeTagMinutesForDay(wBudgetsCapped);
    for (const [tagId, mins] of dayPlanned) {
      plannedByTagWeek.set(tagId, (plannedByTagWeek.get(tagId) || 0) + mins);
    }
    const sortedWB = [...wBudgetsCapped].sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
    if (sortedWB.length > 0) totalPlannedWeek += timeToMinutes(sortedWB[sortedWB.length - 1].endTime);
  }
  const allTagIdsWeek = new Set([...actualByTagWeek.keys(), ...plannedByTagWeek.keys()]);

  container.innerHTML = `
    <section class="view-section">
      <div class="day-tabs">
        <button class="day-tab ${balanceMode === 'day' ? 'active' : ''}" data-mode="day">Day</button>
        <button class="day-tab ${balanceMode === 'week' ? 'active' : ''}" data-mode="week">Week</button>
      </div>

      ${balanceMode === 'day' ? `
      <div class="balance-nav">
        <button class="nav-arrow" id="bal-prev">‹</button>
        <button class="balance-nav-label" id="bal-date-btn">${formatDateShort(viewingDate)}</button>
        <button class="nav-arrow" id="bal-next">›</button>
      </div>
      <div id="bal-picker-overlay" class="date-picker-overlay hidden">
        <div class="date-picker">
          <div class="picker-header">
            <button class="nav-arrow" id="bal-picker-prev">‹</button>
            <span id="bal-picker-month"></span>
            <button class="nav-arrow" id="bal-picker-next">›</button>
          </div>
          <div class="picker-weekdays"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
          <div class="picker-grid" id="bal-picker-grid"></div>
        </div>
      </div>
      ${allTagIdsDay.size > 0 ? `
      <ul class="balance-list">
        ${renderTagComparison(allTagIdsDay, plannedByTagDay, actualByTagDay, tagMap)}
      </ul>
      ` : '<p class="hint">No data for this day.</p>'}
      ` : `
      <div class="balance-nav">
        <button class="nav-arrow" id="bal-prev">‹</button>
        <button class="balance-nav-label" id="bal-date-btn">${formatWeekLabel(viewingWeekStart)}</button>
        <button class="nav-arrow" id="bal-next">›</button>
      </div>
      <div id="bal-picker-overlay" class="date-picker-overlay hidden">
        <div class="date-picker">
          <div class="picker-header">
            <button class="nav-arrow" id="bal-picker-prev">‹</button>
            <span id="bal-picker-month"></span>
            <button class="nav-arrow" id="bal-picker-next">›</button>
          </div>
          <div class="picker-weekdays"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
          <div class="picker-grid" id="bal-picker-grid"></div>
        </div>
      </div>
      ${allTagIdsWeek.size > 0 ? `
      <ul class="balance-list">
        ${renderTagComparison(allTagIdsWeek, plannedByTagWeek, actualByTagWeek, tagMap)}
      </ul>
      ` : '<p class="hint">No data for this week.</p>'}
      `}
    </section>
  `;

  // Mode tabs
  container.querySelectorAll('.day-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      balanceMode = (btn as HTMLElement).dataset.mode as 'day' | 'week';
      renderBalanceView(container);
    });
  });

  // Nav arrows
  container.querySelector('#bal-prev')!.addEventListener('click', () => {
    if (balanceMode === 'day') shiftDate(-1); else shiftWeek(-1);
    renderBalanceView(container);
  });
  container.querySelector('#bal-next')!.addEventListener('click', () => {
    if (balanceMode === 'day') shiftDate(1); else shiftWeek(1);
    renderBalanceView(container);
  });

  // Date picker
  bindBalancePicker(container);

  // Swipe left/right
  const section = container.querySelector('.view-section') as HTMLElement;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let isHorizontal: boolean | null = null;

  section.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
    isHorizontal = null;
  }, { passive: true });

  section.addEventListener('touchmove', (e) => {
    if (!tracking) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHorizontal === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isHorizontal = Math.abs(dx) > Math.abs(dy);
    }
    if (isHorizontal) e.preventDefault();
  }, { passive: false });

  section.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        if (balanceMode === 'day') shiftDate(1); else shiftWeek(1);
      } else {
        if (balanceMode === 'day') shiftDate(-1); else shiftWeek(-1);
      }
      renderBalanceView(container);
    }
  }, { passive: true });
}

function bindBalancePicker(container: HTMLElement): void {
  const overlay = container.querySelector('#bal-picker-overlay') as HTMLElement;
  const dateBtn = container.querySelector('#bal-date-btn') as HTMLElement;
  if (!overlay || !dateBtn) return;

  let pickerMonth: number;
  let pickerYear: number;

  function getRefDate(): Date {
    if (balanceMode === 'day') {
      return new Date(viewingDate + 'T12:00:00');
    } else {
      return new Date(viewingWeekStart + 'T12:00:00');
    }
  }

  function openPicker() {
    const d = getRefDate();
    pickerMonth = d.getMonth();
    pickerYear = d.getFullYear();
    renderGrid();
    overlay.classList.remove('hidden');
  }

  function closePicker() {
    overlay.classList.add('hidden');
  }

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
  }

  function getMondayOfWeek(dateISO: string): string {
    const d = new Date(dateISO + 'T12:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  }

  function renderGrid() {
    const label = container.querySelector('#bal-picker-month') as HTMLElement;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    label.textContent = `${monthNames[pickerMonth]} ${pickerYear}`;

    const grid = container.querySelector('#bal-picker-grid') as HTMLElement;
    const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
    const firstDay = getFirstDayOfWeek(pickerYear, pickerMonth);

    let html = '';
    for (let i = 0; i < firstDay; i++) {
      html += '<span class="picker-day empty"></span>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = balanceMode === 'day'
        ? iso === viewingDate
        : getMondayOfWeek(iso) === viewingWeekStart;
      const isToday = iso === todayISO();
      const weekHighlight = balanceMode === 'week' && getMondayOfWeek(iso) === viewingWeekStart;
      const classes = ['picker-day', isSelected ? 'selected' : '', isToday ? 'today' : '', weekHighlight ? 'week-highlight' : ''].filter(Boolean).join(' ');
      html += `<span class="${classes}" data-date="${iso}">${day}</span>`;
    }
    grid.innerHTML = html;

    grid.querySelectorAll('.picker-day:not(.empty)').forEach(el => {
      el.addEventListener('click', () => {
        const date = (el as HTMLElement).dataset.date!;
        if (balanceMode === 'day') {
          viewingDate = date;
        } else {
          viewingWeekStart = getMondayOfWeek(date);
        }
        closePicker();
        renderBalanceView(container);
      });
    });
  }

  dateBtn.addEventListener('click', openPicker);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePicker();
  });

  container.querySelector('#bal-picker-prev')!.addEventListener('click', () => {
    pickerMonth--;
    if (pickerMonth < 0) { pickerMonth = 11; pickerYear--; }
    renderGrid();
  });

  container.querySelector('#bal-picker-next')!.addEventListener('click', () => {
    pickerMonth++;
    if (pickerMonth > 11) { pickerMonth = 0; pickerYear++; }
    renderGrid();
  });
}

function renderTagComparison(
  tagIds: Set<string>,
  plannedByTag: Map<string, number>,
  actualByTag: Map<string, number>,
  tagMap: Map<string, { id: string; name: string; colorValue: number }>
): string {
  return Array.from(tagIds).map(tagId => {
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
  }).join('');
}
