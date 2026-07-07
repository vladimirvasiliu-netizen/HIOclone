import { useEffect, type RefObject } from 'react';

/**
 * Apeleaza `handler` cand utilizatorul da click in afara elementului `ref`.
 * Util pentru a inchide dropdown-uri (notificari, meniu user) cand dai click
 * oriunde in alta parte.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [ref, handler]);
}
