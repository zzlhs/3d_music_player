import { useRef, useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

function ImageMesh({ url, nextUrl, transitionMode, cycleNext }: {
  url: string;
  nextUrl: string | null;
  transitionMode: string;
  cycleNext: () => void;
}) {
  const texture = useTexture(url);
  const nextTexture = useTexture(nextUrl ?? '');
  const viewport = useThree((state) => state.viewport);
  const brightness = usePlayerStore((s) => s.settings.backgroundBrightness);
  const fadeStart = usePlayerStore((s) => s.settings.imageFadeStart);
  const fadeEnd = usePlayerStore((s) => s.settings.imageFadeEnd);
  const alphaMode = usePlayerStore((s) => s.settings.imageAlphaMode);

  const material = useMemo(() => {
    const img = texture.image as HTMLImageElement | null;
    const nextImg = nextTexture?.image as HTMLImageElement | null;
    const texAspect = img ? img.width / img.height : 1;
    const nextAspect = nextImg ? nextImg.width / nextImg.height : texAspect;
    const planeAspect = viewport.width / viewport.height;

    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uTexture: { value: texture },
        uNextTexture: { value: nextTexture },
        uBrightness: { value: brightness },
        uFadeStart: { value: fadeStart },
        uFadeEnd: { value: fadeEnd },
        uAlphaMode: { value: alphaMode === 'edgeFade' ? 1 : alphaMode === 'rightFade' ? 2 : 0 },
        uTexAspect: { value: texAspect },
        uNextAspect: { value: nextAspect },
        uPlaneAspect: { value: planeAspect },
        uProgress: { value: 0 },
        uHasNext: { value: 0 },
        uTransitionMode: { value: transitionMode === 'slide' ? 1 : transitionMode === 'rotate' ? 2 : 0 },
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
        uniform sampler2D uNextTexture;
        uniform float uBrightness;
        uniform float uFadeStart;
        uniform float uFadeEnd;
        uniform float uAlphaMode;
        uniform float uTexAspect;
        uniform float uNextAspect;
        uniform float uPlaneAspect;
        uniform float uProgress;
        uniform float uHasNext;
        uniform float uTransitionMode;
        varying vec2 vUv;

        vec2 cover(vec2 uv, float ta, float pa) {
          vec2 r = uv;
          if (ta > pa) { float s = ta / pa; r.x = (uv.x - 0.5) * s + 0.5; }
          else         { float s = pa / ta; r.y = (uv.y - 0.5) * s + 0.5; }
          return r;
        }

        float getAlpha(vec2 uv) {
          if (uAlphaMode < 0.5) return 1.0;
          if (uAlphaMode < 1.5) return 1.0 - smoothstep(uFadeStart, uFadeEnd, uv.x);
          float l = smoothstep(0.0, 0.15, uv.x);
          float r = 1.0 - smoothstep(0.85, 1.0, uv.x);
          float t = smoothstep(0.0, 0.1, uv.y);
          float b = 1.0 - smoothstep(0.9, 1.0, uv.y);
          return min(min(l, r), min(t, b));
        }

        void main() {
          vec2 cuv = cover(vUv, uTexAspect, uPlaneAspect);
          if (cuv.x < 0.0 || cuv.x > 1.0 || cuv.y < 0.0 || cuv.y > 1.0) discard;
          vec4 cur = texture2D(uTexture, cuv);
          float a = getAlpha(vUv);
          vec4 col = vec4(cur.rgb * uBrightness, cur.a * a);

          if (uHasNext > 0.5 && uProgress > 0.0) {
            float p = uProgress;
            vec2 nuv = cover(vUv, uNextAspect, uPlaneAspect);
            vec4 nxt = texture2D(uNextTexture, nuv);
            float na = getAlpha(vUv);

            if (uTransitionMode < 0.5) {
              col = mix(col, vec4(nxt.rgb * uBrightness, nxt.a * na), p);
            } else if (uTransitionMode < 1.5) {
              float offset = (1.0 - p) * 0.6;
              vec2 suv = cover(vec2(vUv.x + offset, vUv.y), uNextAspect, uPlaneAspect);
              vec4 sld = texture2D(uNextTexture, suv);
              float sa = getAlpha(vec2(vUv.x + offset, vUv.y));
              float mask = smoothstep(1.0 - p, 1.0, vUv.x);
              col = mix(col, vec4(sld.rgb * uBrightness, sld.a * sa), mask);
            } else {
              float angle = p * 1.2;
              vec2 c = vUv - 0.5;
              float ca = cos(angle), sa = sin(angle);
              vec2 ruv = cover(vec2(c.x*ca - c.y*sa, c.x*sa + c.y*ca) + 0.5, uNextAspect, uPlaneAspect);
              vec4 rot = texture2D(uNextTexture, ruv);
              float ra = getAlpha(vec2(0.5, 0.5));
              float sc = 0.6 + 0.4 * p;
              float sm = step(abs(vUv.x-0.5), sc/2.0) * step(abs(vUv.y-0.5), sc/2.0);
              col = mix(col, vec4(rot.rgb * uBrightness, rot.a * ra), p * sm);
            }
          }
          gl_FragColor = col;
        }
      `,
    });
  }, [texture, nextTexture, brightness, fadeStart, fadeEnd, alphaMode, transitionMode, viewport.width, viewport.height]);

  useEffect(() => {
    const mat = material;
    mat.uniforms.uBrightness.value = brightness;
    mat.uniforms.uFadeStart.value = fadeStart;
    mat.uniforms.uFadeEnd.value = fadeEnd;
    mat.uniforms.uAlphaMode.value = alphaMode === 'edgeFade' ? 1 : alphaMode === 'rightFade' ? 2 : 0;
  }, [brightness, fadeStart, fadeEnd, alphaMode, material]);

  useEffect(() => {
    const mat = material;
    if (nextUrl && nextTexture) {
      mat.uniforms.uHasNext.value = 1;
      mat.uniforms.uProgress.value = 0;
      const start = performance.now();
      const duration = 600;
      let frame: number;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        mat.uniforms.uProgress.value = t;
        if (t >= 1) {
          mat.uniforms.uHasNext.value = 0;
          mat.uniforms.uProgress.value = 0;
          cycleNext();
        } else {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }
  }, [nextUrl, nextTexture, material, cycleNext]);

  return (
    <mesh position={[0, 0, -1]} scale={[viewport.width, viewport.height, 1]}>
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

  const cycleNext = () => {
    const images = usePlayerStore.getState().backgroundImages;
    const curId = usePlayerStore.getState().activeBackgroundImageId;
    const curIdx = images.findIndex((i) => i.id === curId);
    if (curIdx >= 0 && images.length > 1) {
      const nextIdx = (curIdx + 1) % images.length;
      const nextId = images[nextIdx].id;
      nextIdRef.current = nextId;
      setActiveBackgroundImageId(nextId);
    }
    nextIdRef.current = null;
  };

  useEffect(() => {
    if (!cycleEnabled || backgroundImages.length < 2) return;
    const interval = setInterval(() => {
      const images = usePlayerStore.getState().backgroundImages;
      const curId = usePlayerStore.getState().activeBackgroundImageId;
      const curIdx = images.findIndex((i) => i.id === curId);
      if (curIdx >= 0 && images.length > 1) {
        const nextIdx = (curIdx + 1) % images.length;
        usePlayerStore.getState().setActiveBackgroundImageId(images[nextIdx].id);
      }
    }, cycleInterval * 1000);
    return () => clearInterval(interval);
  }, [cycleEnabled, cycleInterval, backgroundImages.length]);

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
