import { useCallback, useRef } from 'react';

export function useObjectUrl() {
  const urlRef = useRef<string | null>(null);

  const createUrl = useCallback((file: File): string => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    return url;
  }, []);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  return { createUrl, revokeUrl, currentUrl: urlRef };
}
