import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { findActiveIndex } from '../lib/lyricSync';
import type { LyricLine } from '../types';

export function useLyricSync(
  audio: HTMLAudioElement | null,
  lyrics: LyricLine[]
) {
  const { setActiveIndex, setCurrentTime, performanceMode } = usePlayerStore();
  const rafRef = useRef<number>(0);
  const lastTick = useRef(0);

  useEffect(() => {
    if (!audio) return;

    const interval = performanceMode ? 50 : 16;

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);

      if (now - lastTick.current < interval) return;
      lastTick.current = now;

      const time = audio.currentTime;
      setCurrentTime(time);
      const idx = findActiveIndex(time, lyrics);
      setActiveIndex(idx);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [audio, lyrics, setActiveIndex, setCurrentTime, performanceMode]);
}
