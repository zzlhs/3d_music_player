import type { LyricLine } from '../types';

export function findActiveIndex(currentTime: number, lyrics: LyricLine[]): number {
  if (!lyrics.length) return -1;

  let left = 0;
  let right = lyrics.length - 1;
  let result = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (lyrics[mid].time <= currentTime) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}
