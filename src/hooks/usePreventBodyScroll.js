import { useEffect } from 'react';

let lockCount = 0;

/**
 * Custom hook to lock body scrolling when a modal/dialog is active.
 * Uses a ref count to support nested/stacked modals safely.
 */
export function usePreventBodyScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    lockCount++;
    if (lockCount === 1) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [enabled]);
}

export default usePreventBodyScroll;
