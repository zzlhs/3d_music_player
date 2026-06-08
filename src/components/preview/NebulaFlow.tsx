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
        uColor1: { value: new THREE.Color('#6366f1') },
        uColor2: { value: new THREE.Color('#a78bfa') },
        uColor3: { value: new THREE.Color('#f472b6') },
        uOpacity: { value: 0.6 },
        uSpeed: { value: 0.3 },
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
        uniform float uSpeed;
        varying vec2 vUv;

        // simplex-like noise fbm
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p = rot * p * 2.0 + vec2(100.0 + uTime * 0.02);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          float d = length(uv);

          vec2 p1 = uv * 2.5 + uTime * uSpeed * 0.03;
          vec2 p2 = uv * 3.5 - uTime * uSpeed * 0.02;

          float n1 = fbm(p1);
          float n2 = fbm(p2);
          float n = n1 * 0.6 + n2 * 0.4;

          vec3 color = mix(uColor1, uColor2, n);
          color = mix(color, uColor3, (uv.x + 1.0) * 0.5 * (0.5 - n * 0.3));

          float alpha = n * 0.8 * uOpacity * smoothstep(1.8, 0.0, d);
          alpha = clamp(alpha, 0.0, 1.0);

          // Add bright wisps
          float wisp = pow(n, 3.0) * 1.5;
          color += vec3(0.8, 0.7, 1.0) * wisp * 0.3;

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
    mat.uniforms.uSpeed.value = speed * 0.3;

    const reactive = settings.backgroundEffectAudioReactive;
    const bass = audioEnergy.bass;
    mat.uniforms.uOpacity.value = 0.5 + bass * reactive * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1.5]} scale={[8, 5, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} />
    </mesh>
  );
}
