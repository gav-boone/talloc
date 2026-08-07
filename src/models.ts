export interface Tag {
  id: string;
  name: string;
  colorValue: number;
}

export interface TimeTransaction {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  endTime: string; // HH:MM (24h format) — end time of this entry
  tags: string[]; // tag IDs (can be empty)
  note?: string;
}

export interface Goal {
  id: string;
  text: string;
  tags: string[]; // optional tag IDs
  period: 'daily' | 'weekly';
  done: boolean;
}

export interface Budget {
  id: string;
  day: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  endTime: string; // HH:MM — end time of this planned block
  tags: string[]; // optional tag IDs
  note?: string;
}
