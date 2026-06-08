import type { LyricLine } from '../types';

export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  let offset = 0;

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('[offset:')) {
      const match = trimmed.match(/\[offset:(-?\d+)\]/);
      if (match) {
        offset = parseInt(match[1], 10);
      }
      continue;
    }

    if (/^\[(ti|ar|al|by|re|ve):/.test(trimmed)) continue;

    const timestamps: string[] = [];
    let text = trimmed;

    const globalRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    let match;
    while ((match = globalRegex.exec(trimmed)) !== null) {
      timestamps.push(match[0]);
    }

    if (timestamps.length === 0) continue;

    text = trimmed.replace(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/g, '').trim();
    if (!text) continue;

    for (const ts of timestamps) {
      const m = ts.match(timeRegex);
      if (!m) continue;
      const minutes = parseInt(m[1], 10);
      const seconds = parseInt(m[2], 10);
      let millis = parseInt(m[3], 10);
      if (m[3].length === 2) millis *= 10;

      let time = minutes * 60 + seconds + millis / 1000;
      time += offset / 1000;
      if (time < 0) time = 0;

      result.push({ time, text });
    }
  }

  result.sort((a, b) => a.time - b.time);
  return result;
}
