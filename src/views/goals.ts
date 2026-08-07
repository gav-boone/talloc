import { Goal } from '../models';
import { getGoals, addGoal, updateGoal, deleteGoal, getTags } from '../storage';
import { generateId, colorFromValue, escapeHtml } from '../utils';
import { renderTagSelector, bindTagSelector } from '../tag-selector';

const MAX_GOALS_PER_PERIOD = 3;

let editingGoalId: string | null = null;

export function renderGoalsView(container: HTMLElement): void {
  const tags = getTags();
  const goals = getGoals();

  const dailyGoals = goals.filter(g => g.period === 'daily');
  const weeklyGoals = goals.filter(g => g.period === 'weekly');
  const canAddDaily = dailyGoals.length < MAX_GOALS_PER_PERIOD;
  const canAddWeekly = weeklyGoals.length < MAX_GOALS_PER_PERIOD;

  const editingGoal = editingGoalId ? goals.find(g => g.id === editingGoalId) : null;

  container.innerHTML = `
    <section class="view-section">

      <div class="goals-section">
        <div class="goals-section-header">
          <h2>Daily</h2>
          <span class="goals-count">${dailyGoals.length}/${MAX_GOALS_PER_PERIOD}</span>
        </div>
        <ul class="goals-list">
          ${dailyGoals.map(g => renderGoalItem(g, tags)).join('')}
        </ul>
        ${canAddDaily ? renderAddForm('daily', tags) : ''}
      </div>

      <div class="goals-section">
        <div class="goals-section-header">
          <h2>Weekly</h2>
          <span class="goals-count">${weeklyGoals.length}/${MAX_GOALS_PER_PERIOD}</span>
        </div>
        <ul class="goals-list">
          ${weeklyGoals.map(g => renderGoalItem(g, tags)).join('')}
        </ul>
        ${canAddWeekly ? renderAddForm('weekly', tags) : ''}
      </div>

      ${editingGoal ? `
      <div class="entry-form-overlay" id="goal-tag-overlay">
        <div class="entry-form">
          <h3>Tags for: ${escapeHtml(editingGoal.text)}</h3>
          <div class="form-group">
            ${renderTagSelector('goal-edit-tags', new Set(editingGoal.tags))}
          </div>
          <div class="entry-form-actions">
            <button class="btn btn-primary" id="goal-tag-save">Done</button>
          </div>
        </div>
      </div>
      ` : ''}
    </section>
  `;

  bindInteractions(container);
}

function renderGoalItem(goal: Goal, allTags: ReturnType<typeof getTags>): string {
  const tagMap = new Map(allTags.map(t => [t.id, t]));
  const goalTags = goal.tags.map(id => tagMap.get(id)).filter(Boolean);

  return `
    <li class="goal-item-simple ${goal.done ? 'done' : ''}">
      <button class="goal-check" data-id="${goal.id}" aria-label="${goal.done ? 'Mark undone' : 'Mark done'}">
        ${goal.done ? '✓' : ''}
      </button>
      <span class="goal-text">${escapeHtml(goal.text)}</span>
      <div class="goal-tags-area" data-id="${goal.id}">
        ${goalTags.length > 0 ? `
          ${goalTags.map(t => `<span class="tag-chip-sm" style="background:${colorFromValue(t!.colorValue)}">${escapeHtml(t!.name)}</span>`).join('')}
        ` : '<span class="goal-tag-hint">+ tag</span>'}
      </div>
      <button class="btn-icon btn-delete" data-id="${goal.id}" aria-label="Delete goal">×</button>
    </li>
  `;
}

function renderAddForm(period: 'daily' | 'weekly', tags: ReturnType<typeof getTags>): string {
  return `
    <form class="goal-add-form" data-period="${period}">
      <div class="goal-add-row">
        <input type="text" class="goal-text-input" placeholder="Add a goal..." required />
        <button type="submit" class="btn btn-primary btn-sm">+</button>
      </div>
      ${renderTagSelector(`goal-tags-${period}`, new Set())}
    </form>
  `;
}

function bindInteractions(container: HTMLElement): void {
  // Toggle done
  container.querySelectorAll('.goal-check').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      const goals = getGoals();
      const goal = goals.find(g => g.id === id);
      if (goal) {
        updateGoal({ ...goal, done: !goal.done });
        renderGoalsView(container);
      }
    });
  });

  // Delete
  container.querySelectorAll('.goals-list .btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      deleteGoal(id);
      renderGoalsView(container);
    });
  });

  // Add forms
  container.querySelectorAll('.goal-add-form').forEach(form => {
    const formEl = form as HTMLFormElement;
    const period = formEl.dataset.period as Goal['period'];
    const selectedTags = bindTagSelector(container, `goal-tags-${period}`, new Set<string>());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = formEl.querySelector('.goal-text-input') as HTMLInputElement;
      const text = input.value.trim();
      if (!text) return;

      const goal: Goal = {
        id: generateId(),
        text,
        tags: Array.from(selectedTags),
        period,
        done: false,
      };
      addGoal(goal);
      renderGoalsView(container);
    });
  });

  // Click tags area to edit tags on existing goal
  container.querySelectorAll('.goal-tags-area').forEach(area => {
    area.addEventListener('click', () => {
      const id = (area as HTMLElement).dataset.id!;
      editingGoalId = id;
      renderGoalsView(container);
    });
  });

  // Goal tag edit overlay
  const tagOverlay = container.querySelector('#goal-tag-overlay');
  if (tagOverlay) {
    const editingGoal = getGoals().find(g => g.id === editingGoalId);
    if (editingGoal) {
      const editTagIds = bindTagSelector(container, 'goal-edit-tags', new Set(editingGoal.tags));

      container.querySelector('#goal-tag-save')!.addEventListener('click', () => {
        updateGoal({ ...editingGoal, tags: Array.from(editTagIds) });
        editingGoalId = null;
        renderGoalsView(container);
      });

      tagOverlay.addEventListener('click', (e) => {
        if (e.target === tagOverlay) {
          // Save on background click too
          updateGoal({ ...editingGoal, tags: Array.from(editTagIds) });
          editingGoalId = null;
          renderGoalsView(container);
        }
      });
    }
  }
}
