import { useMemo } from 'react';
import * as THREE from 'three';

export function DarkGradientPlane() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uOpacity: { value: 0.55 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uOpacity;
        void main() {
          float alpha = smoothstep(0.5, 0.9, vUv.x);
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * uOpacity);
        }
      `,
    });
  }, []);

  return (
    <mesh position={[0, 0, -0.5]} scale={[12, 6, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} />
    </mesh>
  );
}
