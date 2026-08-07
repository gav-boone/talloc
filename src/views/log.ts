import { TimeTransaction } from '../models';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getTags } from '../storage';
import { generateId, todayISO, colorFromValue, escapeHtml, timeToMinutes, formatTime12, formatDuration, minutesToTime } from '../utils';
import { renderTagSelector, bindTagSelector } from '../tag-selector';

let selectedDate: string = todayISO();

// State for creating a new entry
let pendingEndSlot: number | null = null; // minutes from midnight

// State for editing an existing entry
let editingTxId: string | null = null;

function shiftDate(days: number): void {
  const d = new Date(selectedDate + 'T12:00:00');
  d.setDate(d.getDate() + days);
  selectedDate = d.toISOString().slice(0, 10);
}

function formatDateDisplay(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const today = todayISO();
  const yesterday = (() => { const y = new Date(); y.setDate(y.getDate() - 1); return y.toISOString().slice(0, 10); })();
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMonthYear(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

/** Format minutes as "12 AM", "1 PM", etc. */
function formatHour(mins: number): string {
  const h = Math.floor(mins / 60);
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

/** Get transactions for a day sorted by endTime ascending */
function getDayTransactions(date: string): TimeTransaction[] {
  return getTransactions()
    .filter(tx => tx.date === date)
    .sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));
}

/** Get the next available start (= last entry's end, or 00:00) */
function getNextStartMinutes(date: string): number {
  const txs = getDayTransactions(date);
  if (txs.length === 0) return 0;
  return timeToMinutes(txs[txs.length - 1].endTime);
}

export function renderLogView(container: HTMLElement): void {
  pendingEndSlot = null;

  container.innerHTML = `
    <section class="view-section log-view">
      <div class="day-nav">
        <button class="nav-arrow" id="prev-day" aria-label="Previous day">‹</button>
        <button class="day-nav-date" id="date-display">${formatDateDisplay(selectedDate)}</button>
        <button class="nav-arrow" id="next-day" aria-label="Next day">›</button>
      </div>
      <div id="date-picker-overlay" class="date-picker-overlay hidden">
        <div class="date-picker">
          <div class="picker-header">
            <button class="nav-arrow" id="picker-prev-month">‹</button>
            <span id="picker-month-label"></span>
            <button class="nav-arrow" id="picker-next-month">›</button>
          </div>
          <div class="picker-weekdays">
            <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
          </div>
          <div class="picker-grid" id="picker-grid"></div>
        </div>
      </div>
      <div id="day-content" class="day-content">
        ${renderDayContent()}
      </div>
    </section>
  `;

  bindNavigation(container);
  bindSwipe(container);
  bindDatePicker(container);
  bindDayInteractions(container);
}

function renderDayContent(): string {
  const tags = getTags();
  const tagMap = new Map(tags.map(t => [t.id, t]));
  const dayTxs = getDayTransactions(selectedDate);
  const nextStartMins = getNextStartMinutes(selectedDate);

  // Build the time grid (each row = 1 hour, each cell = 15 min)
  const SLOT_SIZE = 15; // minutes per slot
  const TOTAL_SLOTS = 96; // 24 hours * 4 slots

  // Build a map of which slots are filled and by which transaction
  const slotMap: (TimeTransaction | null)[] = new Array(TOTAL_SLOTS).fill(null);
  let prevEnd = 0;
  for (const tx of dayTxs) {
    const endMins = timeToMinutes(tx.endTime);
    const startSlot = Math.floor(prevEnd / SLOT_SIZE);
    const endSlot = Math.floor(endMins / SLOT_SIZE);
    for (let s = startSlot; s < endSlot && s < TOTAL_SLOTS; s++) {
      slotMap[s] = tx;
    }
    prevEnd = endMins;
  }

  // Determine which hours to show (from first available to end of activity + a few hours)
  const startHour = Math.floor(nextStartMins / 60);
  const lastFilledSlot = slotMap.reduce((last, tx, i) => tx ? i : last, -1);
  const showFromHour = 0;
  const showToHour = 24;

  // Entry form (shown when pendingEndSlot is set)
  const entryFormHtml = pendingEndSlot !== null ? `
    <div class="entry-form-overlay" id="entry-form-overlay">
      <div class="entry-form">
        <h3>Log: ${formatTime12(minutesToTime(nextStartMins))} → ${formatTime12(minutesToTime(pendingEndSlot))}</h3>
        <p class="entry-duration">${formatDuration(pendingEndSlot - nextStartMins)}</p>
        <div class="form-group">
          <input type="text" id="log-note" placeholder="Note (optional)" aria-label="Note" />
        </div>
        ${tags.length > 0 ? `
        <div class="form-group">
          ${renderTagSelector('entry-tags', selectedTagIds)}
        </div>
        ` : ''}
        <div class="entry-form-actions">
          <button class="btn btn-secondary" id="entry-cancel">Cancel</button>
          <button class="btn btn-primary" id="entry-confirm">Save</button>
        </div>
      </div>
    </div>
  ` : '';

  // Edit form (shown when editingTxId is set)
  const editingTx = editingTxId ? getDayTransactions(selectedDate).find(t => t.id === editingTxId) : null;
  const editFormHtml = editingTx ? (() => {
    const txIdx = getDayTransactions(selectedDate).indexOf(editingTx);
    const allDayTxs = getDayTransactions(selectedDate);
    let editStart = '00:00';
    for (let i = 0; i < txIdx; i++) {
      editStart = allDayTxs[i].endTime;
    }
    return `
      <div class="entry-form-overlay" id="edit-form-overlay">
        <div class="entry-form">
          <button class="btn-icon form-close" id="edit-cancel" aria-label="Close">×</button>
          <h3>Edit: ${formatTime12(editStart)} → ${formatTime12(editingTx.endTime)}</h3>
          <p class="entry-duration">${formatDuration(timeToMinutes(editingTx.endTime) - timeToMinutes(editStart))}</p>
          <div class="form-group">
            <input type="text" id="edit-note" placeholder="Note (optional)" aria-label="Note" value="${editingTx.note ? escapeHtml(editingTx.note) : ''}" />
          </div>
          ${tags.length > 0 ? `
          <div class="form-group">
            ${renderTagSelector('edit-tags', new Set(editingTx.tags))}
          </div>
          ` : ''}
          <div class="entry-form-actions">
            <button class="btn btn-danger" id="edit-delete">Delete</button>
            <button class="btn btn-primary" id="edit-save">Save</button>
          </div>
        </div>
      </div>
    `;
  })() : '';

  // Time grid — vertical layout like Google/Outlook calendar
  // Group consecutive slots with the same transaction into blocks
  type Block = { tx: TimeTransaction | null; startSlot: number; endSlot: number; isAvailable: boolean };

  // Remove hour-boundary splitting — blocks merge freely now
  // Recompute blocks without hour boundary splits
  const mergedBlocks: Block[] = [];
  let mergeBlock: Block | null = null;
  for (let slot = Math.floor(showFromHour * 4); slot < Math.floor(showToHour * 4); slot++) {
    const slotMins = slot * SLOT_SIZE;
    const tx = slotMap[slot];
    const isAvailable = slotMins >= nextStartMins && !tx;

    if (mergeBlock && mergeBlock.tx === tx && mergeBlock.isAvailable === isAvailable) {
      mergeBlock.endSlot = slot + 1;
    } else {
      if (mergeBlock) mergedBlocks.push(mergeBlock);
      mergeBlock = { tx, startSlot: slot, endSlot: slot + 1, isAvailable };
    }
  }
  if (mergeBlock) mergedBlocks.push(mergeBlock);

  // Generate hour gutter labels (positioned absolutely)
  const totalSlots = (showToHour - showFromHour) * 4;
  const gutterHtml = Array.from({ length: showToHour - showFromHour }, (_, i) => {
    const hour = showFromHour + i;
    const top = i * 4 * 28; // 4 slots per hour, 28px per slot
    return `<span class="cal-gutter" style="top:${top}px">${formatHour(hour * 60)}</span>`;
  }).join('');

  // Generate blocks
  const blocksHtml = mergedBlocks.map(block => {
    const startMins = block.startSlot * SLOT_SIZE;
    const endMins = block.endSlot * SLOT_SIZE;
    const height = (block.endSlot - block.startSlot) * 28;
    const tx = block.tx;
    const txTag = tx ? tx.tags.map(id => tagMap.get(id)).find(Boolean) : null;
    const bgColor = tx ? (txTag ? colorFromValue(txTag.colorValue) : 'var(--surface-hover)') : '';

    if (tx) {
      const allTags = tx.tags.map(id => tagMap.get(id)).filter(Boolean);
      const tagNails = allTags.map((t, i) => 
        `<span class="cal-nail" style="background:${colorFromValue(t!.colorValue)};right:${i * 6}px"></span>`
      ).join('');
      const tagChips = allTags.map(t => 
        `<span class="cal-tag-chip" style="border-color:${colorFromValue(t!.colorValue)};color:${colorFromValue(t!.colorValue)}">${escapeHtml(t!.name)}</span>`
      ).join('');
      return `
        <div class="cal-block filled" data-tx-id="${tx.id}" style="height:${height}px">
          <div class="cal-content">
            ${tx.note ? `<span class="cal-note">${escapeHtml(tx.note)}</span>` : ''}
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

  const gridHtml = `
    <div class="time-grid" id="time-grid">
      <div class="cal-gutter-layer">${gutterHtml}</div>
      <div class="cal-blocks-layer">${blocksHtml}</div>
    </div>
  `;

  return gridHtml + entryFormHtml + editFormHtml;
}

function refreshDayContent(container: HTMLElement): void {
  const dateDisplay = container.querySelector('#date-display') as HTMLElement;
  dateDisplay.textContent = formatDateDisplay(selectedDate);

  const dayContent = container.querySelector('#day-content') as HTMLElement;
  dayContent.innerHTML = renderDayContent();

  bindDayInteractions(container);
}

function bindDayInteractions(container: HTMLElement): void {
  bindGridClicks(container);
  bindFilledBlockClicks(container);
  bindEntryForm(container);
  bindEditForm(container);
}

function bindGridClicks(container: HTMLElement): void {
  const grid = container.querySelector('#time-grid');
  if (!grid) return;

  grid.querySelectorAll('.cal-slot.available').forEach(slot => {
    slot.addEventListener('click', () => {
      const slotMins = parseInt((slot as HTMLElement).dataset.slotMins!);
      // End time is the end of this slot (slot + 15 min)
      pendingEndSlot = slotMins + 15;
      refreshDayContent(container);
    });
  });
}

function bindFilledBlockClicks(container: HTMLElement): void {
  const grid = container.querySelector('#time-grid');
  if (!grid) return;

  grid.querySelectorAll('.cal-block.filled').forEach(block => {
    (block as HTMLElement).style.cursor = 'pointer';
    block.addEventListener('click', () => {
      const txId = (block as HTMLElement).dataset.txId;
      if (txId) {
        editingTxId = txId;
        refreshDayContent(container);
      }
    });
  });
}

function bindEditForm(container: HTMLElement): void {
  const overlay = container.querySelector('#edit-form-overlay');
  if (!overlay) return;

  const editingTx = getDayTransactions(selectedDate).find(t => t.id === editingTxId);
  if (!editingTx) return;

  const editTagIds = new Set(editingTx.tags);

  // Bind tag selector with search
  bindTagSelector(container, 'edit-tags', editTagIds);

  // Save
  container.querySelector('#edit-save')!.addEventListener('click', () => {
    const note = (container.querySelector('#edit-note') as HTMLInputElement).value || undefined;
    const tags = Array.from(editTagIds);

    // Compute blocks for this transaction
    const dayTxs = getDayTransactions(selectedDate);
    const txIdx = dayTxs.findIndex(t => t.id === editingTx.id);
    const startMins = txIdx === 0 ? 0 : timeToMinutes(dayTxs[txIdx - 1].endTime);
    const endMins = timeToMinutes(editingTx.endTime);
    const numBlocks = Math.round((endMins - startMins) / 15);

    if (tags.length > numBlocks) {
      alert(`Too many tags: ${tags.length} tags for ${numBlocks} block${numBlocks > 1 ? 's' : ''}. Max 1 tag per 15-min block.`);
      return;
    }

    updateTransaction({ ...editingTx, tags, note });
    editingTxId = null;
    refreshDayContent(container);
  });

  // Cancel
  container.querySelector('#edit-cancel')!.addEventListener('click', () => {
    editingTxId = null;
    refreshDayContent(container);
  });

  // Delete
  container.querySelector('#edit-delete')!.addEventListener('click', () => {
    if (editingTx) {
      deleteTransaction(editingTx.id);
      editingTxId = null;
      refreshDayContent(container);
    }
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      editingTxId = null;
      refreshDayContent(container);
    }
  });
}

let selectedTagIds: Set<string> = new Set();

function bindEntryForm(container: HTMLElement): void {
  const overlay = container.querySelector('#entry-form-overlay');
  if (!overlay) return;

  // Bind tag selector with search
  bindTagSelector(container, 'entry-tags', selectedTagIds);

  // Cancel
  container.querySelector('#entry-cancel')!.addEventListener('click', () => {
    pendingEndSlot = null;
    refreshDayContent(container);
  });

  // Save
  container.querySelector('#entry-confirm')!.addEventListener('click', () => {
    if (pendingEndSlot === null) return;
    const note = (container.querySelector('#log-note') as HTMLInputElement).value || undefined;
    const nextStartMins = getNextStartMinutes(selectedDate);
    const numBlocks = Math.round((pendingEndSlot - nextStartMins) / 15);
    const tags = Array.from(selectedTagIds);

    if (tags.length > numBlocks) {
      alert(`Too many tags: ${tags.length} tags for ${numBlocks} block${numBlocks > 1 ? 's' : ''}. Max 1 tag per 15-min block.`);
      return;
    }

    const tx: TimeTransaction = {
      id: generateId(),
      date: selectedDate,
      endTime: minutesToTime(pendingEndSlot),
      tags,
      note,
    };

    addTransaction(tx);
    pendingEndSlot = null;
    selectedTagIds = new Set();
    refreshDayContent(container);
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      pendingEndSlot = null;
      refreshDayContent(container);
    }
  });
}


function bindNavigation(container: HTMLElement): void {
  container.querySelector('#prev-day')!.addEventListener('click', () => {
    shiftDate(-1);
    pendingEndSlot = null;
    refreshDayContent(container);
  });

  container.querySelector('#next-day')!.addEventListener('click', () => {
    shiftDate(1);
    pendingEndSlot = null;
    refreshDayContent(container);
  });
}

function bindSwipe(container: HTMLElement): void {
  const dayContent = container.querySelector('#day-content') as HTMLElement;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let isHorizontal: boolean | null = null;

  dayContent.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
    isHorizontal = null;
  }, { passive: true });

  dayContent.addEventListener('touchmove', (e) => {
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

  dayContent.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX;
    const dy = endY - startY;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        shiftDate(1);
      } else {
        shiftDate(-1);
      }
      pendingEndSlot = null;
      refreshDayContent(container);
    }
  }, { passive: true });
}

function bindDatePicker(container: HTMLElement): void {
  const overlay = container.querySelector('#date-picker-overlay') as HTMLElement;
  const dateBtn = container.querySelector('#date-display') as HTMLElement;
  let pickerMonth: number;
  let pickerYear: number;

  function openPicker() {
    const d = new Date(selectedDate + 'T12:00:00');
    pickerMonth = d.getMonth();
    pickerYear = d.getFullYear();
    renderPickerGrid();
    overlay.classList.remove('hidden');
  }

  function closePicker() {
    overlay.classList.add('hidden');
  }

  function renderPickerGrid() {
    const label = container.querySelector('#picker-month-label') as HTMLElement;
    label.textContent = formatMonthYear(`${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-01`);

    const grid = container.querySelector('#picker-grid') as HTMLElement;
    const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
    const firstDay = getFirstDayOfWeek(pickerYear, pickerMonth);

    let html = '';
    for (let i = 0; i < firstDay; i++) {
      html += '<span class="picker-day empty"></span>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = iso === selectedDate;
      const isToday = iso === todayISO();
      const classes = ['picker-day', isSelected ? 'selected' : '', isToday ? 'today' : ''].filter(Boolean).join(' ');
      html += `<span class="${classes}" data-date="${iso}">${day}</span>`;
    }
    grid.innerHTML = html;

    grid.querySelectorAll('.picker-day:not(.empty)').forEach(el => {
      el.addEventListener('click', () => {
        selectedDate = (el as HTMLElement).dataset.date!;
        pendingEndSlot = null;
        closePicker();
        refreshDayContent(container);
      });
    });
  }

  dateBtn.addEventListener('click', openPicker);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePicker();
  });

  container.querySelector('#picker-prev-month')!.addEventListener('click', () => {
    pickerMonth--;
    if (pickerMonth < 0) { pickerMonth = 11; pickerYear--; }
    renderPickerGrid();
  });

  container.querySelector('#picker-next-month')!.addEventListener('click', () => {
    pickerMonth++;
    if (pickerMonth > 11) { pickerMonth = 0; pickerYear++; }
    renderPickerGrid();
  });
}
