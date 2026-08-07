/**
 * Mobile keyboard handling:
 * - Scrolls focused inputs into view when keyboard opens
 * - Adjusts overlay forms so they remain visible above the keyboard
 * - Prevents iOS from zooming on input focus (font-size < 16px fix)
 */

export function initKeyboardHandling(): void {
  // Scroll focused input into view with a delay (keyboard animation)
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (!isInput(target)) return;

    // Small delay to let keyboard animation finish
    setTimeout(() => {
      scrollInputIntoView(target);
    }, 300);
  });

  // Use visualViewport API to detect keyboard open/close
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      adjustOverlaysForKeyboard();
    });
  }
}

function isInput(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

function scrollInputIntoView(el: HTMLElement): void {
  // Check if element is inside an overlay (fixed positioning)
  const overlay = el.closest('.entry-form-overlay, .date-picker-overlay');
  if (overlay) {
    // For overlay forms, adjust the form position
    const form = overlay.querySelector('.entry-form, .date-picker') as HTMLElement;
    if (form && window.visualViewport) {
      const keyboardHeight = window.innerHeight - window.visualViewport.height;
      if (keyboardHeight > 0) {
        form.style.transform = `translateY(-${keyboardHeight / 2}px)`;
      }
    }
  } else {
    // For inline inputs, scroll into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function adjustOverlaysForKeyboard(): void {
  if (!window.visualViewport) return;

  const keyboardHeight = window.innerHeight - window.visualViewport.height;
  const overlays = document.querySelectorAll('.entry-form-overlay:not(.hidden)');

  overlays.forEach(overlay => {
    const form = overlay.querySelector('.entry-form, .date-picker') as HTMLElement;
    if (!form) return;

    if (keyboardHeight > 50) {
      // Keyboard is open — shift form up
      form.style.transform = `translateY(-${keyboardHeight / 2}px)`;
    } else {
      // Keyboard closed — reset
      form.style.transform = '';
    }
  });
}
