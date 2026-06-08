import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

export function CalmGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  const audioEnergy = usePlayerStore((s) => s.audioEnergy);
  const settings = usePlayerStore((s) => s.settings);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#38bdf8') },
        uColor2: { value: new THREE.Color('#818cf8') },
        uColor3: { value: new THREE.Color('#f472b6') },
        uOpacity: { value: 0.8 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          float d = length(uv);

          float pulse = sin(uTime * 0.6 + d * 2.0) * 0.3 + 0.7;
          float glow = exp(-d * 2.5) * 1.2;
          float ring = sin(d * 8.0 - uTime * 0.8) * 0.5 + 0.5;
          ring *= exp(-d * 1.5) * 0.6;

          vec2 dir = uv / max(d, 0.001);
          float swirl = sin(dir.x * 3.0 + dir.y * 3.0 + uTime * 0.4) * 0.5 + 0.5;
          vec3 color = mix(uColor1, uColor2, swirl);
          color = mix(color, uColor3, sin(uTime * 0.15) * 0.5 + 0.5);

          float alpha = (glow * pulse * 1.5 + ring) * uOpacity * smoothstep(1.8, 0.0, d);
          alpha = clamp(alpha, 0.0, 1.0);

          gl_FragColor = vec4(color, alpha * 0.9);
        }
      `,
    });
  }, []);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const speed = settings.backgroundEffectSpeed;
    mat.uniforms.uTime.value += delta * speed;

    const reactive = settings.backgroundEffectAudioReactive;
    const overall = audioEnergy.overall;
    mat.uniforms.uOpacity.value = 0.6 + overall * reactive * 0.6;
  });

  return (
    <mesh ref={meshRef} position={[1.5, 0, -1]} scale={[7, 5, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} />
    </mesh>
  );
}
