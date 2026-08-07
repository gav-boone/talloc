/**
 * Mobile keyboard handling for iOS:
 * - Repositions overlay forms to stay within the visual viewport when keyboard opens
 * - Prevents page from scrolling away from focused input
 */

export function initKeyboardHandling(): void {
  if (!window.visualViewport) return;

  window.visualViewport.addEventListener('resize', onViewportResize);
  window.visualViewport.addEventListener('scroll', onViewportScroll);

  // On focus, ensure the overlay stays positioned correctly after keyboard animates
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (!isInput(target)) return;

    // Multiple delays to catch keyboard animation at different stages
    setTimeout(repositionOverlays, 100);
    setTimeout(repositionOverlays, 300);
    setTimeout(repositionOverlays, 500);
  });
}

function isInput(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

function onViewportResize(): void {
  repositionOverlays();
}

function onViewportScroll(): void {
  repositionOverlays();
}

function repositionOverlays(): void {
  const vv = window.visualViewport;
  if (!vv) return;

  const overlays = document.querySelectorAll('.entry-form-overlay, .date-picker-overlay:not(.hidden)');
  overlays.forEach(overlay => {
    const el = overlay as HTMLElement;
    // Position the overlay to fill the visual viewport, not the layout viewport
    el.style.position = 'fixed';
    el.style.top = `${vv.offsetTop}px`;
    el.style.left = `${vv.offsetLeft}px`;
    el.style.width = `${vv.width}px`;
    el.style.height = `${vv.height}px`;
  });
}
