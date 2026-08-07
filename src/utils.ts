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
