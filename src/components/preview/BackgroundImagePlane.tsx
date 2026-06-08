import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

function ImageMesh({ url }: { url: string }) {
  const texture = useTexture(url);
  const viewport = useThree((state) => state.viewport);
  const brightness = usePlayerStore((s) => s.settings.backgroundBrightness);
  const fadeStart = usePlayerStore((s) => s.settings.imageFadeStart);
  const fadeEnd = usePlayerStore((s) => s.settings.imageFadeEnd);

  const material = useMemo(() => {
    const img = texture.image as HTMLImageElement | null;
    const texAspect = img ? img.width / img.height : 1;
    const planeW = viewport.width * 0.52;
    const planeH = viewport.height * 1.05;
    const planeAspect = planeW / planeH;

    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uTexture: { value: texture },
        uBrightness: { value: brightness },
        uFadeStart: { value: fadeStart },
        uFadeEnd: { value: fadeEnd },
        uTexAspect: { value: texAspect },
        uPlaneAspect: { value: planeAspect },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uBrightness;
        uniform float uFadeStart;
        uniform float uFadeEnd;
        uniform float uTexAspect;
        uniform float uPlaneAspect;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          if (uTexAspect > uPlaneAspect) {
            float scale = uTexAspect / uPlaneAspect;
            uv.x = (vUv.x - 0.5) * scale + 0.5;
          } else {
            float scale = uPlaneAspect / uTexAspect;
            uv.y = (vUv.y - 0.5) * scale + 0.5;
          }
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;

          vec4 texColor = texture2D(uTexture, uv);
          float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, vUv.x);
          float alpha = texColor.a * fade;
          gl_FragColor = vec4(texColor.rgb * uBrightness, alpha);
        }
      `,
    });
  }, [texture, brightness, fadeStart, fadeEnd, viewport.width, viewport.height]);

  const planeW = viewport.width * 0.52;
  const planeH = viewport.height * 1.05;

  return (
    <mesh position={[-viewport.width * 0.24, 0, -1]} scale={[planeW, planeH, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} />
    </mesh>
  );
}

export function BackgroundImagePlane() {
  const backgroundImageUrl = usePlayerStore((s) => s.backgroundImageUrl);

  if (!backgroundImageUrl) return null;

  return <ImageMesh url={backgroundImageUrl} />;
}
