import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

export function LightTunnelEffect() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const audioEnergy = usePlayerStore((s) => s.audioEnergy);
  const settings = usePlayerStore((s) => s.settings);

  const count = 100;
  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.5;
      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const z1 = -Math.random() * 6;
      const len = 0.4 + Math.random() * 1.2;
      pos[i6] = x1;
      pos[i6 + 1] = y1;
      pos[i6 + 2] = z1;
      pos[i6 + 3] = x1 * (1 + len * 0.3);
      pos[i6 + 4] = y1 * (1 + len * 0.3);
      pos[i6 + 5] = z1 - len;
    }
    return { positions: pos };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: '#88ccff',
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_state, delta) => {
    if (!linesRef.current) return;
    const pos = linesRef.current.geometry.attributes.position.array as Float32Array;
    const speed = settings.backgroundEffectSpeed * 0.8;
    const reactive = settings.backgroundEffectAudioReactive;
    const boost = 1 + audioEnergy.bass * reactive;

    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      pos[i6 + 2] += speed * delta * boost * 3;
      pos[i6 + 5] += speed * delta * boost * 3;

      if (pos[i6 + 2] > 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 1.5;
        pos[i6] = Math.cos(angle) * radius;
        pos[i6 + 1] = Math.sin(angle) * radius;
        pos[i6 + 2] = -6;
        const len = 0.4 + Math.random() * 1.2;
        pos[i6 + 3] = pos[i6] * (1 + len * 0.3);
        pos[i6 + 4] = pos[i6 + 1] * (1 + len * 0.3);
        pos[i6 + 5] = -6 - len;
      }
    }

    linesRef.current.geometry.attributes.position.needsUpdate = true;
    const opacity = 0.25 + audioEnergy.mid * reactive * 0.4;
    (linesRef.current.material as THREE.Material).opacity = Math.min(0.7, opacity);
  });

  return <lineSegments ref={linesRef} geometry={geometry} material={material} />;
}
