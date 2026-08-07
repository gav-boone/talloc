import { Tag } from '../models';
import { getTags, addTag, updateTag, deleteTag } from '../storage';
import { generateId, colorFromValue, escapeHtml, TAG_COLORS } from '../utils';

let selectedColorValue: number = TAG_COLORS[0];

export function renderSettingsView(container: HTMLElement): void {
  const tags = getTags();

  container.innerHTML = `
    <section class="view-section">
      <h1>Settings</h1>
      
      <h2>Tags</h2>
      <p class="subtitle">Manage your tags for categorizing time entries.</p>
      <form id="tag-form" class="form-card">
        <div class="form-group">
          <input type="text" id="tag-name" placeholder="New tag name..." required />
        </div>
        <div class="form-group">
          <div class="color-palette" id="color-palette">
            ${TAG_COLORS.map(c => `
              <button type="button" class="color-swatch ${c === selectedColorValue ? 'active' : ''}" data-color="${c}" style="background:${colorFromValue(c)}" aria-label="Select color"></button>
            `).join('')}
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Tag</button>
      </form>
      <ul id="tag-list" class="tag-list">
        ${tags.map(tag => `
          <li class="tag-item" data-id="${tag.id}">
            <span class="tag-chip" style="background:${colorFromValue(tag.colorValue)}">${escapeHtml(tag.name)}</span>
            <div class="tag-actions">
              <button class="btn-icon btn-edit" data-id="${tag.id}" aria-label="Edit tag">✎</button>
              <button class="btn-icon btn-delete" data-id="${tag.id}" aria-label="Delete tag">×</button>
            </div>
          </li>
        `).join('')}
      </ul>
      ${tags.length === 0 ? '<p class="hint">No tags yet. Add some above to organize your time entries.</p>' : ''}

      <h2>Data</h2>
      <div class="form-card">
        <div class="form-group">
          <label for="export-email">Email export to</label>
          <input type="email" id="export-email" placeholder="your@email.com" />
        </div>
        <button id="export-btn" class="btn btn-secondary">Send Export</button>
        <button id="clear-btn" class="btn btn-danger" style="margin-top:8px">Clear All Data</button>
      </div>
    </section>
  `;

  // Color palette selection
  container.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      selectedColorValue = parseInt((swatch as HTMLElement).dataset.color!);
      container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

  // Add tag
  const form = container.querySelector('#tag-form') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('tag-name') as HTMLInputElement).value.trim();
    if (!name) return;

    const tag: Tag = { id: generateId(), name, colorValue: selectedColorValue };
    addTag(tag);
    renderSettingsView(container);
  });

  // Delete tags
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      if (confirm('Delete this tag?')) {
        deleteTag(id);
        renderSettingsView(container);
      }
    });
  });

  // Edit tags (inline rename)
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      const tag = tags.find(t => t.id === id);
      if (!tag) return;
      const newName = prompt('Rename tag:', tag.name);
      if (newName && newName.trim()) {
        updateTag({ ...tag, name: newName.trim() });
        renderSettingsView(container);
      }
    });
  });

  // Export
  container.querySelector('#export-btn')!.addEventListener('click', () => {
    const emailInput = container.querySelector('#export-email') as HTMLInputElement;
    const email = emailInput.value.trim();
    if (!email || !emailInput.validity.valid) {
      emailInput.reportValidity();
      return;
    }

    const data = {
      tags: localStorage.getItem('talloc_tags'),
      transactions: localStorage.getItem('talloc_transactions'),
      goals: localStorage.getItem('talloc_goals'),
      budgets: localStorage.getItem('talloc_budgets'),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const subject = `Talloc Export — ${new Date().toISOString().slice(0, 10)}`;

    // Try Web Share API with file (mobile)
    if (navigator.share && navigator.canShare) {
      const file = new File([jsonStr], `talloc-export-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
      const shareData = { title: subject, files: [file] };
      if (navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {
          // Fallback to mailto
          openMailto(email, subject, jsonStr);
        });
        return;
      }
    }

    // Fallback: mailto
    openMailto(email, subject, jsonStr);
  });

  // Clear
  container.querySelector('#clear-btn')!.addEventListener('click', () => {
    if (confirm('This will delete ALL your data. Are you sure?')) {
      localStorage.removeItem('talloc_tags');
      localStorage.removeItem('talloc_transactions');
      localStorage.removeItem('talloc_goals');
      localStorage.removeItem('talloc_budgets');
      renderSettingsView(container);
    }
  });
}


function openMailto(email: string, subject: string, body: string): void {
  // mailto has length limits, truncate if needed
  const maxBody = 1500;
  const truncatedBody = body.length > maxBody ? body.slice(0, maxBody) + '\n...(truncated, use Share for full data)' : body;
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(truncatedBody)}`;
  window.location.href = mailto;
}
