export function generateId(): string {
  return crypto.randomUUID();
}

export function formatBlocks(blocks: number): string {
  const hours = Math.floor(blocks / 4);
  const mins = (blocks % 4) * 15;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function startOfWeekISO(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export function colorFromValue(value: number): string {
  const hex = (value & 0xFFFFFF).toString(16).padStart(6, '0');
  return `#${hex}`;
}

export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Convert HH:MM to total minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Convert total minutes since midnight to HH:MM */
export function minutesToTime(mins: number): string {
  if (mins >= 1440) return '24:00';
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Calculate blocks between two HH:MM times */
export function blocksBetween(startTime: string, endTime: string): number {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const diff = endMins - startMins;
  if (diff <= 0) return 0;
  return Math.round(diff / 15);
}

/** Format HH:MM for display (12h) */
export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (h === 24) return '12:00am';
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

/** Format duration in minutes as human readable */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}


/** 16 preset tag colors */
export const TAG_COLORS: number[] = [
  0xFF4CAF50, // green
  0xFF2196F3, // blue
  0xFFF44336, // red
  0xFFFF9800, // orange
  0xFF9C27B0, // purple
  0xFF00BCD4, // cyan
  0xFFE91E63, // pink
  0xFF8BC34A, // light green
  0xFFFFEB3B, // yellow
  0xFF3F51B5, // indigo
  0xFF009688, // teal
  0xFFFF5722, // deep orange
  0xFF795548, // brown
  0xFF607D8B, // blue grey
  0xFFCDDC39, // lime
  0xFF673AB7, // deep purple
];
