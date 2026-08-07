export interface Category {
  id: string;
  name: string;
  colorValue: number;
  isArchived: boolean;
}

export interface TimeTransaction {
  id: string;
  startTime: string; // ISO date string
  blocks: number; // each block = 15 minutes
  categoryId: string;
  note?: string;
}

export interface Goal {
  id: string;
  categoryId: string;
  targetBlocks: number;
  period: 'daily' | 'weekly';
  type: 'atLeast' | 'atMost' | 'exactly';
}

export interface Budget {
  id: string;
  categoryId: string;
  blocksPerDay: number;
}
