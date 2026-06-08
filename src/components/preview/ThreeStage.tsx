import { Canvas } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { BackgroundImagePlane } from './BackgroundImagePlane';
import { DarkGradientPlane } from './DarkGradientPlane';
import { BackgroundEffects } from './BackgroundEffects';
import { LyricScene } from './LyricScene';
import { Effects } from './Effects';
import { usePlayerStore } from '../../store/playerStore';

function WelcomeOverlay() {
  const selectedTrackId = usePlayerStore((s) => s.selectedTrackId);

  if (selectedTrackId) return null;

  return (
    <group position={[0, 0, 0]}>
      <Text
        font="/fonts/NotoSansSC-Regular.ttf"
        fontSize={0.18}
        color="#555555"
        anchorX="center"
        anchorY="middle"
      >
        选择音乐文件夹开始播放
      </Text>
    </group>
  );
}

function NoLyricsOverlay() {
  const lyrics = usePlayerStore((s) => s.lyrics);
  const selectedTrackId = usePlayerStore((s) => s.selectedTrackId);

  if (!selectedTrackId || lyrics.length > 0) return null;

  return (
    <group position={[0, 0, 0]}>
      <Text
        font="/fonts/NotoSansSC-Regular.ttf"
        fontSize={0.16}
        color="#444444"
        anchorX="center"
        anchorY="middle"
      >
        无歌词文件
      </Text>
    </group>
  );
}

export function ThreeStage() {
  const performanceMode = usePlayerStore((s) => s.performanceMode);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <Canvas
        dpr={performanceMode ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 40 }}
        gl={{
          antialias: !performanceMode,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#000000']} />
        <BackgroundImagePlane />
        <DarkGradientPlane />
        <BackgroundEffects />
        <WelcomeOverlay />
        <NoLyricsOverlay />
        <LyricScene />
        <Effects />
      </Canvas>
    </div>
  );
}
