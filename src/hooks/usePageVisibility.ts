import { useEffect } from 'react';

export const pageVisibleRef = { current: true };

export function usePageVisibility() {
  useEffect(() => {
    const handler = () => {
      pageVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);
}
