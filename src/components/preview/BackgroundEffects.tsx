import { usePlayerStore } from '../../store/playerStore';
import { ParticleField } from './ParticleField';
import { LightStreaks } from './LightStreaks';
import { NebulaFlow } from './NebulaFlow';
import { CalmGlow } from './CalmGlow';
import { LightTunnelEffect } from './LightTunnelEffect';

export function BackgroundEffects() {
  const preset = usePlayerStore((s) => s.settings.backgroundEffectPreset);
  const particleAmount = usePlayerStore((s) => s.settings.particleAmount);
  const speed = usePlayerStore((s) => s.settings.backgroundEffectSpeed);
  const audioReactive = usePlayerStore((s) => s.settings.backgroundEffectAudioReactive);

  switch (preset) {
    case 'starDust':
      return (
        <ParticleField
          count={particleAmount}
          speed={speed}
          audioReactive={audioReactive}
          size={0.045}
          type="float"
        />
      );

    case 'snowFall':
      return (
        <ParticleField
          count={particleAmount}
          speed={speed}
          audioReactive={audioReactive}
          color="#ffffff"
          size={0.05}
          type="fall"
        />
      );

    case 'blueRain':
      return (
        <>
          <ParticleField
            count={Math.floor(particleAmount * 0.6)}
            speed={speed * 1.5}
            audioReactive={audioReactive}
            color="#88ccff"
            size={0.04}
            type="rain"
          />
          <LightStreaks />
        </>
      );

    case 'nebulaFlow':
      return (
        <>
          <ParticleField
            count={Math.floor(particleAmount * 0.3)}
            speed={speed * 0.5}
            audioReactive={audioReactive}
            size={0.035}
            color="#a78bfa"
            type="float"
          />
          <NebulaFlow />
        </>
      );

    case 'lightTunnel':
      return (
        <>
          <ParticleField
            count={Math.floor(particleAmount * 0.4)}
            speed={speed * 1.2}
            audioReactive={audioReactive}
            color="#ffffff"
            size={0.025}
            type="rain"
          />
          <LightTunnelEffect />
        </>
      );

    case 'calmGlow':
      return (
        <>
          <ParticleField
            count={Math.floor(particleAmount * 0.2)}
            speed={speed * 0.3}
            audioReactive={audioReactive}
            size={0.02}
            color="#93c5fd"
            type="float"
          />
          <CalmGlow />
        </>
      );

    default:
      return null;
  }
}
