import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

export function LightStreaks() {
  const meshRef = useRef<THREE.LineSegments>(null);
  const audioEnergy = usePlayerStore((s) => s.audioEnergy);
  const settings = usePlayerStore((s) => s.settings);

  const count = 120;
  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      const x = (Math.random() - 0.5) * 7;
      const y = (Math.random() - 0.5) * 5;
      const z = -Math.random() * 5;
      const len = 0.3 + Math.random() * 0.6;
      const angle = (Math.random() - 0.5) * 0.3;
      pos[i6] = x;
      pos[i6 + 1] = y;
      pos[i6 + 2] = z;
      pos[i6 + 3] = x + Math.sin(angle) * len;
      pos[i6 + 4] = y + len * 1.5;
      pos[i6 + 5] = z - Math.random() * 0.5;
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
      color: '#66bbff',
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    const speed = settings.backgroundEffectSpeed;
    const reactive = settings.backgroundEffectAudioReactive;
    const boost = 1 + audioEnergy.mid * reactive;

    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      pos[i6 + 1] += speed * delta * boost * 3;
      pos[i6 + 4] += speed * delta * boost * 3;

      if (pos[i6 + 1] > 3.5) {
        pos[i6 + 1] = -3.5;
        pos[i6 + 4] = -3.5 + (Math.random() - 0.5) * 0.3;
        pos[i6] = (Math.random() - 0.5) * 7;
        pos[i6 + 3] = pos[i6] + (Math.random() - 0.5) * 0.4;
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    const opacity = 0.3 + audioEnergy.mid * reactive * 0.5;
    (meshRef.current.material as THREE.Material).opacity = Math.min(0.8, opacity);
  });

  return <lineSegments ref={meshRef} geometry={geometry} material={material} />;
}
