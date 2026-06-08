import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { usePlayerStore } from '../../store/playerStore';

export function Effects() {
  const { bloomIntensity, vignetteStrength } = usePlayerStore((s) => s.settings);

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.5}
        mipmapBlur={false}
        levels={4}
      />
      <Vignette
        darkness={vignetteStrength}
        offset={0.4}
      />
    </EffectComposer>
  );
}
