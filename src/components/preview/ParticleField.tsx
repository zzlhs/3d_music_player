import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

type ParticleFieldProps = {
  count: number;
  speed: number;
  audioReactive: number;
  color?: string;
  size?: number;
  type?: 'float' | 'fall' | 'rain';
};

export function ParticleField({
  count,
  speed,
  audioReactive,
  color = '#ffffff',
  size = 0.02,
  type = 'float',
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const audioEnergy = usePlayerStore((s) => s.audioEnergy);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const performanceMode = usePlayerStore((s) => s.performanceMode);
  const skipFrames = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const spread = 6;
    const depth = 4;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * spread * 2;
      pos[i3 + 1] = (Math.random() - 0.5) * spread;
      pos[i3 + 2] = -Math.random() * depth;

      if (type === 'fall') {
        vel[i3 + 1] = -(0.005 + Math.random() * 0.01);
      } else if (type === 'rain') {
        vel[i3 + 1] = -(0.03 + Math.random() * 0.04);
        vel[i3] = (Math.random() - 0.5) * 0.01;
      } else {
        vel[i3] = (Math.random() - 0.5) * 0.003;
        vel[i3 + 1] = (0.002 + Math.random() * 0.005);
        vel[i3 + 2] = (Math.random() - 0.5) * 0.002;
      }
    }

    return { positions: pos, velocities: vel };
  }, [count, type]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, [color, size]);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const throttle = performanceMode ? 3 : 1;
    skipFrames.current = (skipFrames.current + 1) % throttle;
    if (skipFrames.current !== 0 && !isPlaying) return;

    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    const energyBoost = isPlaying ? 1 + audioEnergy.overall * audioReactive * 0.5 : 1;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      if (type === 'fall' || type === 'rain') {
        pos[i3 + 1] += velocities[i3 + 1] * speed * energyBoost * delta * 30;
        if (pos[i3 + 1] < -3) {
          pos[i3 + 1] = 3;
          pos[i3] = (Math.random() - 0.5) * 12;
          pos[i3 + 2] = -Math.random() * 4;
        }
      } else {
        pos[i3] += velocities[i3] * speed * delta * 30;
        pos[i3 + 1] += velocities[i3 + 1] * speed * delta * 30;
        pos[i3 + 2] += velocities[i3 + 2] * speed * delta * 30;

        if (Math.abs(pos[i3]) > 6) velocities[i3] *= -1;
        if (Math.abs(pos[i3 + 1]) > 3) velocities[i3 + 1] *= -1;
        if (pos[i3 + 2] > 0) pos[i3 + 2] = -4;
        if (pos[i3 + 2] < -4) pos[i3 + 2] = 0;
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;

    if (audioReactive > 0 && isPlaying) {
      const opacity = Math.min(1, 0.5 + audioEnergy.overall * audioReactive * 0.5);
      (meshRef.current.material as THREE.Material).opacity = opacity;
    }
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}
