import { Category, TimeTransaction, Goal, Budget } from './models';

const KEYS = {
  categories: 'talloc_categories',
  transactions: 'talloc_transactions',
  goals: 'talloc_goals',
  budgets: 'talloc_budgets',
} as const;

function load<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Categories
export function getCategories(): Category[] {
  return load<Category>(KEYS.categories);
}

export function saveCategories(cats: Category[]): void {
  save(KEYS.categories, cats);
}

export function addCategory(cat: Category): void {
  const cats = getCategories();
  cats.push(cat);
  saveCategories(cats);
}

export function updateCategory(cat: Category): void {
  const cats = getCategories().map(c => c.id === cat.id ? cat : c);
  saveCategories(cats);
}

export function deleteCategory(id: string): void {
  saveCategories(getCategories().filter(c => c.id !== id));
}

// Transactions
export function getTransactions(): TimeTransaction[] {
  return load<TimeTransaction>(KEYS.transactions);
}

export function saveTransactions(txs: TimeTransaction[]): void {
  save(KEYS.transactions, txs);
}

export function addTransaction(tx: TimeTransaction): void {
  const txs = getTransactions();
  txs.push(tx);
  saveTransactions(txs);
}

export function updateTransaction(tx: TimeTransaction): void {
  const txs = getTransactions().map(t => t.id === tx.id ? tx : t);
  saveTransactions(txs);
}

export function deleteTransaction(id: string): void {
  saveTransactions(getTransactions().filter(t => t.id !== id));
}

// Goals
export function getGoals(): Goal[] {
  return load<Goal>(KEYS.goals);
}

export function saveGoals(goals: Goal[]): void {
  save(KEYS.goals, goals);
}

export function addGoal(goal: Goal): void {
  const goals = getGoals();
  goals.push(goal);
  saveGoals(goals);
}

export function updateGoal(goal: Goal): void {
  const goals = getGoals().map(g => g.id === goal.id ? goal : g);
  saveGoals(goals);
}

export function deleteGoal(id: string): void {
  saveGoals(getGoals().filter(g => g.id !== id));
}

// Budgets
export function getBudgets(): Budget[] {
  return load<Budget>(KEYS.budgets);
}

export function saveBudgets(budgets: Budget[]): void {
  save(KEYS.budgets, budgets);
}

export function addBudget(budget: Budget): void {
  const budgets = getBudgets();
  budgets.push(budget);
  saveBudgets(budgets);
}

export function updateBudget(budget: Budget): void {
  const budgets = getBudgets().map(b => b.id === budget.id ? budget : b);
  saveBudgets(budgets);
}

export function deleteBudget(id: string): void {
  saveBudgets(getBudgets().filter(b => b.id !== id));
}
