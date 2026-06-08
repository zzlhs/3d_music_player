import { useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { messages } from './messages';

type DeepRecord = { [key: string]: string | DeepRecord };

function resolve(obj: DeepRecord, path: string): string {
  const parts = path.split('.');
  let current: DeepRecord | string = obj;
  for (const part of parts) {
    if (typeof current === 'object' && current !== null && part in current) {
      current = current[part] as DeepRecord | string;
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function useI18n() {
  const locale = usePlayerStore((s) => s.locale);
  const setLocale = usePlayerStore((s) => s.setLocale);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      let text = resolve(messages[locale] as DeepRecord, path);
      if (params) {
        for (const [key, val] of Object.entries(params)) {
          text = text.replace(`{${key}}`, String(val));
        }
      }
      return text;
    },
    [locale]
  );

  return { t, locale, setLocale };
}
