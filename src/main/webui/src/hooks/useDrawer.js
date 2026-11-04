import { useEffect, useRef, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

let locks = 0;
let previousOverflow;

// Keep touch scrolling inside the drawer and return keyboard focus to its opener.
export function useDrawer(open, onClose) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    if (locks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    const focusable = () => [...(panelRef.current?.querySelectorAll(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
    ) || [])].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
    let frame;
    const focusPanel = () => {
      const panel = panelRef.current;
      if (!panel) return;
      // The first animation frame can still carry the closed drawer's visibility.
      if (getComputedStyle(panel).visibility === 'hidden' || panel.inert) {
        frame = requestAnimationFrame(focusPanel);
        return;
      }
      (focusable()[0] || panel).focus({ preventScroll: true });
    };
    frame = requestAnimationFrame(focusPanel);
    const handleKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      } else if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          panelRef.current?.focus();
        } else if (event.shiftKey && (document.activeElement === first || !panelRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKey);
      if (--locks === 0) document.body.style.overflow = previousOverflow;
      if (opener?.isConnected && opener.getClientRects().length) opener.focus({ preventScroll: true });
    };
  }, [open]);

  return panelRef;
}
