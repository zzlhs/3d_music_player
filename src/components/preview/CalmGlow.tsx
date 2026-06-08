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
        uOpacity: { value: 0.9 },
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

        float glow(vec2 pos, vec2 center, float radius, float softness) {
          float d = length(pos - center) / radius;
          return exp(-d * d * softness * 4.0);
        }

        float easeInOutSine(float x) {
          return -(cos(3.14159 * x) - 1.0) / 2.0;
        }

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          float d = length(uv);

          // Multiple glow sources
          vec2 c1 = vec2(sin(uTime * 0.2) * 0.3, cos(uTime * 0.15) * 0.2);
          vec2 c2 = vec2(cos(uTime * 0.25) * 0.4, sin(uTime * 0.2) * 0.3);
          vec2 c3 = vec2(sin(uTime * 0.1 + 1.0) * 0.5, cos(uTime * 0.12 + 2.0) * 0.4);

          float breath1 = easeInOutSine(sin(uTime * 0.3) * 0.5 + 0.5);
          float breath2 = easeInOutSine(sin(uTime * 0.2 + 1.5) * 0.5 + 0.5);
          float breath3 = easeInOutSine(sin(uTime * 0.25 + 3.0) * 0.5 + 0.5);

          float g1 = glow(uv, c1, 0.6 + breath1 * 0.3, 2.0 + breath1);
          float g2 = glow(uv, c2, 0.5 + breath2 * 0.2, 2.5 + breath2);
          float g3 = glow(uv, c3, 0.4 + breath3 * 0.2, 3.0 + breath3);

          vec3 col1 = uColor1 * g1 * 1.5;
          vec3 col2 = uColor2 * g2 * 1.2;
          vec3 col3 = uColor3 * g3 * 0.8;

          vec3 color = col1 + col2 + col3;

          // Outer halo
          float halo = exp(-d * 1.5) * 0.4;
          float timeShift = easeInOutSine(sin(uTime * 0.15) * 0.5 + 0.5);
          color += mix(uColor1, uColor3, timeShift) * halo;

          float alpha = clamp((g1 + g2 + g3) * 1.5 + halo, 0.0, 1.0) * uOpacity;
          alpha *= smoothstep(1.5, 0.0, d);

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
    mat.uniforms.uOpacity.value = 0.7 + overall * reactive * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0.5, 0, -1]} scale={[8, 5.5, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} />
    </mesh>
  );
}
