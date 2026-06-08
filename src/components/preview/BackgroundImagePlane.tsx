import { useRef, useEffect, useCallback } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

const FALLBACK_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const TRANSITION_DURATION: Record<string, number> = {
  cut: 0.3,
  crossfade: 1.2,
  slide: 1.0,
  rotate: 1.0,
};

function ImageMesh({ url, nextUrl, transitionMode, cycleNext }: {
  url: string;
  nextUrl: string | null;
  transitionMode: string;
  cycleNext: () => void;
}) {
  const texture = useTexture(url);
  const nextTexture = useTexture(nextUrl ?? FALLBACK_DATA_URL);
  const meshRef = useRef<THREE.Mesh>(null);
  const transitionRef = useRef<{ active: boolean; progress: number; finish: boolean }>({
    active: false,
    progress: 0,
    finish: false,
  });
  const prevUrl = useRef<string>(url);

  // Detect when URL changes (transition triggered externally)
  useEffect(() => {
    if (nextUrl && prevUrl.current !== nextUrl) {
      transitionRef.current = { active: true, progress: 0, finish: false };
    }
    prevUrl.current = url;
  }, [nextUrl, url]);

  const viewport = useThree((state) => state.viewport);
  const fps = usePlayerStore((s) => s.performanceMode ? 2 : 1);

  const uniformsRef = useRef({
    uTexture: { value: texture },
    uNextTexture: { value: nextTexture },
    uTransition: { value: 0 },
    uBrightness: { value: 1 },
    uFadeStart: { value: 0.7 },
    uFadeEnd: { value: 0.95 },
    uAlphaMode: { value: 1 },
    uViewport: { value: new THREE.Vector2(viewport.width, viewport.height) },
  });
  const uniforms = uniformsRef.current;

  // Keep uniforms in sync
  const brightness = usePlayerStore((s) => s.settings.backgroundBrightness);
  const fadeStart = usePlayerStore((s) => s.settings.imageFadeStart);
  const fadeEnd = usePlayerStore((s) => s.settings.imageFadeEnd);
  const alphaMode = usePlayerStore((s) => s.settings.imageAlphaMode);

  uniforms.uTexture.value = texture;
  uniforms.uNextTexture.value = nextTexture;
  uniforms.uBrightness.value = brightness;
  uniforms.uFadeStart.value = fadeStart;
  uniforms.uFadeEnd.value = fadeEnd;
  uniforms.uAlphaMode.value = alphaMode === 'none' ? 0 : alphaMode === 'rightFade' ? 1 : 2;
  uniforms.uViewport.value.set(viewport.width, viewport.height);

  // Animate transition
  const frameSkip = useRef(0);
  useFrame((_, delta) => {
    const tr = transitionRef.current;
    if (!tr.active) return;

    frameSkip.current = (frameSkip.current + 1) % fps;
    if (frameSkip.current !== 0) return;

    const dur = TRANSITION_DURATION[transitionMode] ?? 1.2;
    tr.progress = Math.min(tr.progress + delta / dur, 1);
    uniforms.uTransition.value = tr.progress;

    if (tr.progress >= 1 && !tr.finish) {
      tr.finish = true;
      cycleNext();
    }
  });

  const getShader = useCallback((mode: string) => {
    const alphaFunc = alphaMode === 'none'
      ? `float _alpha = 1.0;`
      : alphaMode === 'rightFade'
        ? `float _alpha = smoothstep(uFadeEnd, uFadeStart, vUv.x);`
        : `float _a1 = smoothstep(0.0, uFadeStart, vUv.x);
           float _a2 = smoothstep(1.0, 1.0 - uFadeStart, vUv.x);
           float _alpha = 1.0 - (1.0 - _a1 * _a2) * step(0.001, uFadeStart);`;

    const transitionBlock = (() => {
      switch (mode) {
        case 'cut':
          return `
            vec4 finalColor = t < 1.0 ? currentColor : nextColor;
            finalColor.a *= _alpha;
          `;
        case 'slide':
          return `
            vec2 slideUv = vUv;
            slideUv.x = vUv.x - t * 0.5;
            vec4 slideCurrent = texture2D(uTexture, clamp(slideUv, 0.0, 1.0)) * uBrightness;
            vec4 slideNext = texture2D(uNextTexture, clamp(vUv + vec2(1.0 - t, 0.0) * 0.5, 0.0, 1.0)) * uBrightness;
            vec4 finalColor = mix(slideCurrent, slideNext, t);
            finalColor.a *= _alpha;
          `;
        case 'rotate':
          return `
            vec2 centered = vUv - 0.5;
            float angle = t * 3.14159 * 0.5;
            float ca = cos(angle);
            float sa = sin(angle);
            vec2 rotated = vec2(
              centered.x * ca - centered.y * sa,
              centered.x * sa + centered.y * ca
            ) + 0.5;
            vec4 rotColor = texture2D(uNextTexture, clamp(rotated, 0.0, 1.0)) * uBrightness;
            vec4 finalColor = mix(currentColor, rotColor, t);
            finalColor.a *= _alpha;
          `;
        default: // crossfade
          return `
            vec4 finalColor = mix(currentColor, nextColor, t);
            finalColor.a *= _alpha;
          `;
      }
    })();

    return `
      uniform sampler2D uTexture;
      uniform sampler2D uNextTexture;
      uniform float uTransition;
      uniform float uBrightness;
      uniform float uFadeStart;
      uniform float uFadeEnd;
      uniform int uAlphaMode;
      uniform vec2 uViewport;
      varying vec2 vUv;

      void main() {
        vec2 texSize = vec2(textureSize(uTexture, 0));
        float scale = max(texSize.x / uViewport.x, texSize.y / uViewport.y);
        vec2 texRatio = texSize / min(texSize.x, texSize.y);
        vec2 vpRatio = uViewport / min(uViewport.x, uViewport.y);
        vec2 mapped = vUv * (vpRatio / texRatio) + (1.0 - vpRatio / texRatio) * 0.5;
        mapped = clamp(mapped, 0.0, 1.0);

        vec4 currentColor = texture2D(uTexture, mapped) * uBrightness;
        vec4 nextColor = texture2D(uNextTexture, mapped) * uBrightness;

        float t = uTransition;

        ${alphaFunc}

        ${transitionBlock}

        gl_FragColor = finalColor;
      }
    `;
  }, [alphaMode]);

  const materialRef = useRef(new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    uniforms,
    fragmentShader: getShader(transitionMode),
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  }));
  const material = materialRef.current;

  // Update fragment shader when transitionMode or alphaMode changes
  useEffect(() => {
    material.fragmentShader = getShader(transitionMode);
    material.needsUpdate = true;
  }, [transitionMode, alphaMode, getShader, material]);

  const aspect = viewport.width / viewport.height;
  const planeH = 8;
  const planeW = planeH * aspect;

  return (
    <mesh ref={meshRef} position={[-1.5, 0, -3]} scale={[planeW, planeH, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} />
    </mesh>
  );
}

export function BackgroundImagePlane() {
  const backgroundImages = usePlayerStore((s) => s.backgroundImages);
  const activeBackgroundImageId = usePlayerStore((s) => s.activeBackgroundImageId);
  const setActiveBackgroundImageId = usePlayerStore((s) => s.setActiveBackgroundImageId);
  const transitionMode = usePlayerStore((s) => s.settings.transitionMode);
  const cycleEnabled = usePlayerStore((s) => s.settings.cycleEnabled);
  const cycleInterval = usePlayerStore((s) => s.settings.cycleInterval);

  const nextIdRef = useRef<string | null>(null);

  const active = backgroundImages.find((i) => i.id === activeBackgroundImageId);
  const next = nextIdRef.current ? backgroundImages.find((i) => i.id === nextIdRef.current) : null;

  const cycleNext = useCallback(() => {
    const nextId = nextIdRef.current;
    if (nextId) {
      setActiveBackgroundImageId(nextId);
      nextIdRef.current = null;
    }
  }, [setActiveBackgroundImageId]);

  // Auto-cycle: prepare next image to trigger transition
  useEffect(() => {
    if (!cycleEnabled || backgroundImages.length < 2) return;
    const interval = setInterval(() => {
      const images = usePlayerStore.getState().backgroundImages;
      const curId = usePlayerStore.getState().activeBackgroundImageId;
      const curIdx = images.findIndex((i) => i.id === curId);
      if (curIdx >= 0 && images.length > 1) {
        const nIdx = (curIdx + 1) % images.length;
        nextIdRef.current = images[nIdx].id;
      }
    }, cycleInterval * 1000);
    return () => clearInterval(interval);
  }, [cycleEnabled, cycleInterval, backgroundImages.length]);

  // Clear nextIdRef when active changes (transition completed externally via cycleNext)
  useEffect(() => {
    if (nextIdRef.current === activeBackgroundImageId) {
      nextIdRef.current = null;
    }
  }, [activeBackgroundImageId]);

  if (!active && backgroundImages.length > 0) {
    setActiveBackgroundImageId(backgroundImages[0].id);
    return null;
  }

  if (!active) return null;

  return (
    <ImageMesh
      url={active.url}
      nextUrl={next?.url ?? null}
      transitionMode={transitionMode}
      cycleNext={cycleNext}
    />
  );
}
