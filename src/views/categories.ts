import { Category } from '../models';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../storage';
import { generateId, colorFromValue, escapeHtml } from '../utils';

const DEFAULT_COLORS = [
  0xFF4CAF50, 0xFF2196F3, 0xFFF44336, 0xFFFF9800,
  0xFF9C27B0, 0xFF00BCD4, 0xFFE91E63, 0xFF8BC34A,
];

export function renderCategoriesView(container: HTMLElement): void {
  const categories = getCategories();

  container.innerHTML = `
    <section class="view-section">
      <h1>Categories</h1>
      <form id="cat-form" class="form-card">
        <div class="form-group">
          <label for="cat-name">Name</label>
          <input type="text" id="cat-name" placeholder="e.g. Work, Sleep, Exercise" required />
        </div>
        <div class="form-group">
          <label for="cat-color">Color</label>
          <input type="color" id="cat-color" value="#4CAF50" />
        </div>
        <button type="submit" class="btn btn-primary">Add Category</button>
      </form>
      <h2>Your Categories</h2>
      <ul id="cat-list" class="category-list">
        ${categories.map(cat => `
          <li class="category-item ${cat.isArchived ? 'archived' : ''}">
            <span class="cat-dot" style="background:${colorFromValue(cat.colorValue)}"></span>
            <span class="cat-name">${escapeHtml(cat.name)}</span>
            ${cat.isArchived ? '<span class="badge">archived</span>' : ''}
            <div class="cat-actions">
              <button class="btn-icon btn-archive" data-id="${cat.id}" aria-label="${cat.isArchived ? 'Unarchive' : 'Archive'}">
                ${cat.isArchived ? '↩' : '📦'}
              </button>
              <button class="btn-icon btn-delete" data-id="${cat.id}" aria-label="Delete category">×</button>
            </div>
          </li>
        `).join('')}
      </ul>
      ${categories.length === 0 ? '<p class="hint">No categories yet. Add one above!</p>' : ''}
    </section>
  `;

  const form = container.querySelector('#cat-form') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('cat-name') as HTMLInputElement).value.trim();
    const colorHex = (document.getElementById('cat-color') as HTMLInputElement).value;
    const colorValue = parseInt(colorHex.replace('#', 'FF'), 16);

    if (!name) return;

    const cat: Category = {
      id: generateId(),
      name,
      colorValue,
      isArchived: false,
    };
    addCategory(cat);
    renderCategoriesView(container);
  });

  container.querySelectorAll('.btn-archive').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      const cat = categories.find(c => c.id === id);
      if (cat) {
        updateCategory({ ...cat, isArchived: !cat.isArchived });
        renderCategoriesView(container);
      }
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      if (confirm('Delete this category? Transactions using it will show "Unknown".')) {
        deleteCategory(id);
        renderCategoriesView(container);
      }
    });
  });
}
