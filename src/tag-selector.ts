import { Tag } from './models';
import { getTags } from './storage';
import { colorFromValue, escapeHtml } from './utils';

/**
 * Render a tag selector with search field.
 * @param selectorId unique id for this selector instance
 * @param selectedIds set of currently selected tag IDs
 */
export function renderTagSelector(selectorId: string, selectedIds: Set<string> = new Set()): string {
  const tags = getTags();
  if (tags.length === 0) return '';

  return `
    <div class="tag-selector-wrapper" id="${selectorId}">
      <input type="text" class="tag-search" placeholder="Search tags..." aria-label="Search tags" />
      <div class="tag-selector-list">
        ${tags.map(t => `
          <button type="button" class="tag-toggle ${selectedIds.has(t.id) ? 'active' : ''}" data-tag-id="${t.id}" style="--tag-color:${colorFromValue(t.colorValue)}">
            ${escapeHtml(t.name)}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Bind search filtering and toggle behavior on a tag selector.
 * Returns a Set that tracks currently selected tag IDs (mutated in place).
 */
export function bindTagSelector(container: HTMLElement, selectorId: string, selectedIds: Set<string>): Set<string> {
  const wrapper = container.querySelector(`#${selectorId}`);
  if (!wrapper) return selectedIds;

  const searchInput = wrapper.querySelector('.tag-search') as HTMLInputElement;
  const buttons = wrapper.querySelectorAll('.tag-toggle');

  // Search filtering
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    buttons.forEach(btn => {
      const name = btn.textContent?.toLowerCase() || '';
      (btn as HTMLElement).style.display = name.includes(query) ? '' : 'none';
    });
  });

  // Toggle selection
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tagId = (btn as HTMLElement).dataset.tagId!;
      if (selectedIds.has(tagId)) {
        selectedIds.delete(tagId);
        btn.classList.remove('active');
      } else {
        selectedIds.add(tagId);
        btn.classList.add('active');
      }
    });
  });

  return selectedIds;
}
