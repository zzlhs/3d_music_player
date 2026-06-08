import { useMemo } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { LyricLine3D } from './LyricLine3D';

const WINDOW = 8;

export function LyricScene() {
  const lyrics = usePlayerStore((s) => s.lyrics);
  const activeIndex = usePlayerStore((s) => s.activeIndex);
  const settings = usePlayerStore((s) => s.settings);

  const visibleLines = useMemo(() => {
    if (!lyrics.length || activeIndex < 0) return [];

    const start = Math.max(0, activeIndex - WINDOW);
    const end = Math.min(lyrics.length - 1, activeIndex + WINDOW);
    const lines = [];

    const keys = new Set<string>();

    for (let i = start; i <= end; i++) {
      const offset = i - activeIndex;
      const abs = Math.abs(offset);

      const targetX = offset === 0 ? -0.12 : 0;
      const targetY = -offset * settings.lineGap;
      const targetZ = -abs * settings.zDepth;

      const isActive = offset === 0;
      const scale = isActive ? settings.activeScale : Math.max(0.72, 1 - abs * 0.055);
      const opacity = isActive ? 1 : Math.max(0.16, 0.68 - abs * 0.085);

      const key = lyrics[i].time + '-' + i;
      if (keys.has(key)) continue;
      keys.add(key);

      lines.push({
        text: lyrics[i].text,
        isActive,
        absOffset: abs,
        targetPosition: [targetX, targetY, targetZ] as [number, number, number],
        targetScale: scale,
        targetOpacity: opacity,
        key,
      });
    }

    return lines;
  }, [lyrics, activeIndex, settings]);

  return (
    <group
      position={[settings.lyricsX, settings.lyricsY, settings.lyricsZ]}
      rotation={[settings.tiltX, settings.tiltY, settings.tiltZ]}
    >
      {visibleLines.map((line) => (
        <LyricLine3D
          key={line.key}
          text={line.text}
          isActive={line.isActive}
          absOffset={line.absOffset}
          targetPosition={line.targetPosition}
          targetScale={line.targetScale}
          targetOpacity={line.targetOpacity}
        />
      ))}
    </group>
  );
}
