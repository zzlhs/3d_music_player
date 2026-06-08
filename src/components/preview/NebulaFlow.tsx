import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

export function NebulaFlow() {
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
        uColor1: { value: new THREE.Color('#818cf8') },
        uColor2: { value: new THREE.Color('#a78bfa') },
        uColor3: { value: new THREE.Color('#c084fc') },
        uOpacity: { value: 0.5 },
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

          float n1 = sin(uv.x * 4.0 + uTime * 0.4) * cos(uv.y * 3.0 + uTime * 0.3);
          float n2 = sin((uv.x + uv.y) * 3.0 - uTime * 0.5) * 0.6;
          float n3 = cos(uv.x * 5.0 + uv.y * 4.0 + uTime * 0.2) * 0.4;
          float n = n1 * 0.5 + n2 + n3;

          n = clamp(n * 0.4 + 0.6, 0.0, 1.0);

          vec3 color = mix(uColor1, uColor2, n);
          color = mix(color, uColor3, (uv.x + 1.0) * 0.5 * (1.0 - n * 0.5));

          float alpha = n * 0.6 * uOpacity * smoothstep(1.5, 0.0, d);

          gl_FragColor = vec4(color, alpha);
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
    const bass = audioEnergy.bass;
    mat.uniforms.uOpacity.value = 0.35 + bass * reactive * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[1.2, 0, -2]} scale={[5, 4, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} />
    </mesh>
  );
}
