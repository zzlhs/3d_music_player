import type { AudioEnergy } from '../types';

export function computeEnergy(data: Uint8Array): AudioEnergy {
  const bass = avg(data.slice(0, 12)) / 255;
  const mid = avg(data.slice(12, 80)) / 255;
  const treble = avg(data.slice(80, 180)) / 255;
  const overall = avg(data) / 255;

  return { bass, mid, treble, overall };
}

function avg(arr: Uint8Array): number {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
}
