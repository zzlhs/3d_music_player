import { useRef, useMemo, type ElementRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';
import { lyricColorThemes } from '../../lib/presets';

type LyricLine3DProps = {
  text: string;
  isActive: boolean;
  absOffset: number;
  targetPosition: [number, number, number];
  targetScale: number;
  targetOpacity: number;
};

export function LyricLine3D({
  text,
  isActive,
  absOffset,
  targetPosition,
  targetScale,
  targetOpacity,
}: LyricLine3DProps) {
  const ref = useRef<THREE.Group>(null);
  const textRef = useRef<ElementRef<typeof Text>>(null);

  const settings = usePlayerStore((s) => s.settings);
  const audioEnergy = usePlayerStore((s) => s.audioEnergy);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const performanceMode = usePlayerStore((s) => s.performanceMode);
  const brightness = settings.lyricBrightness;
  const bold = settings.lyricBold;
  const theme = lyricColorThemes[settings.lyricColorPreset];

  const color = useMemo(() => {
    if (isActive) return theme.activeColor;
    if (absOffset <= 2) return theme.nearColor;
    return theme.farColor;
  }, [isActive, absOffset, theme]);

  const currentPos = useRef(new THREE.Vector3(...targetPosition));
  const currentScale = useRef(targetScale);
  const currentOpacity = useRef(targetOpacity);

  const animTick = useRef(0);

  useFrame(() => {
    if (!ref.current) return;

    animTick.current++;
    const throttle = performanceMode ? 3 : 1;
    if (animTick.current % throttle !== 0 && !isPlaying) return;

    const targetPos = new THREE.Vector3(...targetPosition);
    const lerpFactor = isPlaying ? 0.12 : 0.06;

    currentPos.current.lerp(targetPos, lerpFactor);
    ref.current.position.copy(currentPos.current);

    currentScale.current += (targetScale - currentScale.current) * lerpFactor;
    ref.current.scale.setScalar(currentScale.current);

    currentOpacity.current += (targetOpacity - currentOpacity.current) * lerpFactor;

    if (textRef.current?.material) {
      (textRef.current.material as THREE.Material).opacity = currentOpacity.current * brightness;
    }

    if (isActive && textRef.current) {
      if (isPlaying) {
        const bass = audioEnergy.bass;
        const pulse = 1 + bass * 0.04;
        ref.current.scale.setScalar(currentScale.current * pulse);
      }
      textRef.current.color = theme.activeColor;
    }
  });

  const fontUrl = '/fonts/NotoSansSC-Regular.ttf';

  return (
    <group ref={ref}>
      <Text
        ref={textRef}
        font={fontUrl}
        fontSize={settings.fontSize}
        color={color}
        anchorX="left"
        anchorY="middle"
        maxWidth={4}
        outlineWidth={bold ? 0.04 : 0}
        outlineColor={color}
      >
        {text}
      </Text>
    </group>
  );
}
