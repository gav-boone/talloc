/**
 * Mobile keyboard handling for iOS:
 * - Scrolls focused input into view when keyboard opens
 */

export function initKeyboardHandling(): void {
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (!isInput(target)) return;

    // Delay to let keyboard animation finish, then scroll input into view
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
  });
}

function isInput(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}
