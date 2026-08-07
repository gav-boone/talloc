import { Budget } from '../models';
import { getBudgets, addBudget, deleteBudget, updateBudget, getTags } from '../storage';
import { generateId, colorFromValue, escapeHtml, timeToMinutes, formatTime12, formatDuration, minutesToTime } from '../utils';
import { renderTagSelector, bindTagSelector } from '../tag-selector';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOT_SIZE = 15;

let selectedDay = 0; // 0=Monday
let pendingEndSlot: number | null = null;
let editingBudgetId: string | null = null;
let selectedTagIds: Set<string> = new Set();

function getDayBudgets(day: number): Budget[] {
  return getBudgets()
    .filter(b => b.day === day)
    .sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
}

function getNextStartMinutes(day: number): number {
  const entries = getDayBudgets(day);
  if (entries.length === 0) return 0;
  return timeToMinutes(entries[entries.length - 1].endTime);
}

function formatHour(mins: number): string {
  const h = Math.floor(mins / 60);
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

export function renderBudgetsView(container: HTMLElement): void {
  const tags = getTags();
  const tagMap = new Map(tags.map(t => [t.id, t]));
  const dayBudgets = getDayBudgets(selectedDay);
  const nextStartMins = getNextStartMinutes(selectedDay);

  // Build slot map for this day
  const TOTAL_SLOTS = 96;
  const slotMap: (Budget | null)[] = new Array(TOTAL_SLOTS).fill(null);
  let prevEnd = 0;
  for (const b of dayBudgets) {
    const endMins = timeToMinutes(b.endTime);
    const startSlot = Math.floor(prevEnd / SLOT_SIZE);
    const endSlot = Math.floor(endMins / SLOT_SIZE);
    for (let s = startSlot; s < endSlot && s < TOTAL_SLOTS; s++) {
      slotMap[s] = b;
    }
    prevEnd = endMins;
  }

  // Group into merged blocks
  type Block = { budget: Budget | null; startSlot: number; endSlot: number; isAvailable: boolean };
  const blocks: Block[] = [];
  let currentBlock: Block | null = null;
  for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
    const slotMins = slot * SLOT_SIZE;
    const budget = slotMap[slot];
    const isAvailable = slotMins >= nextStartMins && !budget;
    if (currentBlock && currentBlock.budget === budget && currentBlock.isAvailable === isAvailable) {
      currentBlock.endSlot = slot + 1;
    } else {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { budget, startSlot: slot, endSlot: slot + 1, isAvailable };
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  // Gutter
  const gutterHtml = Array.from({ length: 24 }, (_, i) => {
    const top = i * 4 * 28;
    return `<span class="cal-gutter" style="top:${top}px">${formatHour(i * 60)}</span>`;
  }).join('');

  // Blocks
  const blocksHtml = blocks.map(block => {
    const startMins = block.startSlot * SLOT_SIZE;
    const endMins = block.endSlot * SLOT_SIZE;
    const height = (block.endSlot - block.startSlot) * 28;
    const budget = block.budget;

    if (budget) {
      const allTags = budget.tags.map(id => tagMap.get(id)).filter(Boolean);
      const tagNails = allTags.map((t, i) =>
        `<span class="cal-nail" style="background:${colorFromValue(t!.colorValue)};right:${i * 6}px"></span>`
      ).join('');
      const tagChips = allTags.map(t =>
        `<span class="cal-tag-chip" style="border-color:${colorFromValue(t!.colorValue)};color:${colorFromValue(t!.colorValue)}">${escapeHtml(t!.name)}</span>`
      ).join('');
      return `
        <div class="cal-block filled" data-budget-id="${budget.id}" style="height:${height}px">
          <div class="cal-content">
            ${budget.note ? `<span class="cal-note">${escapeHtml(budget.note)}</span>` : ''}
            ${allTags.length > 0 ? `<div class="cal-tags">${tagChips}</div>` : ''}
          </div>
          <div class="cal-nails">${tagNails}</div>
        </div>
      `;
    } else if (block.isAvailable) {
      let slotsHtml = '';
      for (let s = block.startSlot; s < block.endSlot; s++) {
        const sMins = s * SLOT_SIZE;
        const slotPending = pendingEndSlot !== null && sMins >= nextStartMins && sMins < pendingEndSlot;
        slotsHtml += `<div class="cal-slot available${slotPending ? ' pending' : ''}" data-slot-mins="${sMins}" style="height:28px"></div>`;
      }
      return slotsHtml;
    } else {
      return `<div class="cal-block empty" style="height:${height}px"></div>`;
    }
  }).join('');

  // Edit overlay
  const editingBudget = editingBudgetId ? dayBudgets.find(b => b.id === editingBudgetId) : null;
  const editHtml = editingBudget ? (() => {
    const bIdx = dayBudgets.indexOf(editingBudget);
    let editStart = '00:00';
    for (let i = 0; i < bIdx; i++) editStart = dayBudgets[i].endTime;
    return `
      <div class="entry-form-overlay" id="budget-edit-overlay">
        <div class="entry-form">
          <button class="btn-icon form-close" id="budget-edit-cancel" aria-label="Close">×</button>
          <h3>Edit: ${formatTime12(editStart)} → ${formatTime12(editingBudget.endTime)}</h3>
          <p class="entry-duration">${formatDuration(timeToMinutes(editingBudget.endTime) - timeToMinutes(editStart))}</p>
          <div class="form-group">
            <input type="text" id="budget-edit-note" placeholder="Note (optional)" value="${editingBudget.note ? escapeHtml(editingBudget.note) : ''}" />
          </div>
          ${tags.length > 0 ? `<div class="form-group">${renderTagSelector('budget-edit-tags', new Set(editingBudget.tags))}</div>` : ''}
          <div class="entry-form-actions">
            <button class="btn btn-danger" id="budget-edit-delete">Delete</button>
            <button class="btn btn-primary" id="budget-edit-save">Save</button>
          </div>
        </div>
      </div>
    `;
  })() : '';

  // Add overlay
  const addHtml = pendingEndSlot !== null ? `
    <div class="entry-form-overlay" id="budget-add-overlay">
      <div class="entry-form">
        <button class="btn-icon form-close" id="budget-add-cancel" aria-label="Close">×</button>
        <h3>Plan: ${formatTime12(minutesToTime(nextStartMins))} → ${formatTime12(minutesToTime(pendingEndSlot))}</h3>
        <p class="entry-duration">${formatDuration(pendingEndSlot - nextStartMins)}</p>
        <div class="form-group">
          <input type="text" id="budget-add-note" placeholder="Note (optional)" />
        </div>
        ${tags.length > 0 ? `<div class="form-group">${renderTagSelector('budget-add-tags', selectedTagIds)}</div>` : ''}
        <div class="entry-form-actions">
          <button class="btn btn-primary" id="budget-add-save">Save</button>
        </div>
      </div>
    </div>
  ` : '';

  // Summary
  const summaryHtml = dayBudgets.length > 0 ? `
    <div class="day-summary">
      <span class="summary">Planned: <strong>${formatDuration(nextStartMins)}</strong></span>
      <button class="btn-icon btn-undo" id="budget-undo-last" aria-label="Remove last entry">↩</button>
    </div>
  ` : '';

  container.innerHTML = `
    <section class="view-section log-view">
      <div class="day-tabs">
        ${DAYS_SHORT.map((d, i) => `
          <button class="day-tab ${i === selectedDay ? 'active' : ''}" data-day="${i}">${d}</button>
        `).join('')}
      </div>
      <div id="budget-day-content" class="day-content">
        ${summaryHtml}
        <div class="time-grid" id="budget-time-grid">
          <div class="cal-gutter-layer">${gutterHtml}</div>
          <div class="cal-blocks-layer">${blocksHtml}</div>
        </div>
        ${addHtml}
        ${editHtml}
      </div>
    </section>
  `;

  bindDayTabs(container);
  bindSwipe(container);
  bindGridClicks(container);
  bindFilledClicks(container);
  bindAddForm(container);
  bindEditForm(container);
  bindUndoButton(container);
}

function bindDayTabs(container: HTMLElement): void {
  container.querySelectorAll('.day-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDay = parseInt((btn as HTMLElement).dataset.day!);
      pendingEndSlot = null;
      editingBudgetId = null;
      renderBudgetsView(container);
    });
  });
}

function bindSwipe(container: HTMLElement): void {
  const content = container.querySelector('#budget-day-content') as HTMLElement;
  if (!content) return;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let isHorizontal: boolean | null = null;

  content.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
    isHorizontal = null;
  }, { passive: true });

  content.addEventListener('touchmove', (e) => {
    if (!tracking) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHorizontal === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isHorizontal = Math.abs(dx) > Math.abs(dy);
    }
    if (isHorizontal) {
      e.preventDefault();
    }
  }, { passive: false });

  content.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        selectedDay = (selectedDay + 1) % 7;
      } else {
        selectedDay = (selectedDay + 6) % 7;
      }
      pendingEndSlot = null;
      editingBudgetId = null;
      renderBudgetsView(container);
    }
  }, { passive: true });
}

function bindGridClicks(container: HTMLElement): void {
  const grid = container.querySelector('#budget-time-grid');
  if (!grid) return;
  grid.querySelectorAll('.cal-slot.available').forEach(slot => {
    slot.addEventListener('click', () => {
      const slotMins = parseInt((slot as HTMLElement).dataset.slotMins!);
      pendingEndSlot = slotMins + SLOT_SIZE;
      renderBudgetsView(container);
    });
  });
}

function bindFilledClicks(container: HTMLElement): void {
  const grid = container.querySelector('#budget-time-grid');
  if (!grid) return;
  grid.querySelectorAll('.cal-block.filled').forEach(block => {
    block.addEventListener('click', () => {
      const id = (block as HTMLElement).dataset.budgetId;
      if (id) {
        editingBudgetId = id;
        renderBudgetsView(container);
      }
    });
  });
}

function bindAddForm(container: HTMLElement): void {
  const overlay = container.querySelector('#budget-add-overlay');
  if (!overlay) return;

  bindTagSelector(container, 'budget-add-tags', selectedTagIds);

  container.querySelector('#budget-add-cancel')!.addEventListener('click', () => {
    pendingEndSlot = null;
    renderBudgetsView(container);
  });

  container.querySelector('#budget-add-save')!.addEventListener('click', () => {
    if (pendingEndSlot === null) return;
    const note = (container.querySelector('#budget-add-note') as HTMLInputElement).value || undefined;
    const budget: Budget = {
      id: generateId(),
      day: selectedDay,
      endTime: minutesToTime(pendingEndSlot),
      tags: Array.from(selectedTagIds),
      note,
    };
    addBudget(budget);
    pendingEndSlot = null;
    selectedTagIds = new Set();
    renderBudgetsView(container);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      pendingEndSlot = null;
      renderBudgetsView(container);
    }
  });
}

function bindEditForm(container: HTMLElement): void {
  const overlay = container.querySelector('#budget-edit-overlay');
  if (!overlay) return;

  const editingBudget = getDayBudgets(selectedDay).find(b => b.id === editingBudgetId);
  if (!editingBudget) return;

  const editTagIds = bindTagSelector(container, 'budget-edit-tags', new Set(editingBudget.tags));

  container.querySelector('#budget-edit-cancel')!.addEventListener('click', () => {
    editingBudgetId = null;
    renderBudgetsView(container);
  });

  container.querySelector('#budget-edit-save')!.addEventListener('click', () => {
    const note = (container.querySelector('#budget-edit-note') as HTMLInputElement).value || undefined;
    updateBudget({ ...editingBudget, tags: Array.from(editTagIds), note });
    editingBudgetId = null;
    renderBudgetsView(container);
  });

  container.querySelector('#budget-edit-delete')!.addEventListener('click', () => {
    if (confirm('Remove this planned block?')) {
      deleteBudget(editingBudget.id);
      editingBudgetId = null;
      renderBudgetsView(container);
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      editingBudgetId = null;
      renderBudgetsView(container);
    }
  });
}

function bindUndoButton(container: HTMLElement): void {
  const btn = container.querySelector('#budget-undo-last');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const entries = getDayBudgets(selectedDay);
    if (entries.length > 0) {
      deleteBudget(entries[entries.length - 1].id);
      renderBudgetsView(container);
    }
  });
}
