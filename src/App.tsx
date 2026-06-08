import { useEffect, useRef, useCallback, useState } from 'react';
import { ThreeStage } from './components/preview/ThreeStage';
import { ControlPanel } from './components/ControlPanel';
import { PlayerControls } from './components/PlayerControls';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useAudioAnalyser } from './hooks/useAudioAnalyser';
import { useLyricSync } from './hooks/useLyricSync';
import { usePlayerStore } from './store/playerStore';
import { computeEnergy } from './lib/audioEnergy';

const CONTROLS_HIDE_DELAY = 5000;

function App() {
  const { audio, seek } = useAudioPlayer();
  const { initAnalyser, resumeContext, getEnergy } = useAudioAnalyser(audio);
  const lyrics = usePlayerStore((s) => s.lyrics);
  const setAudioEnergy = usePlayerStore((s) => s.setAudioEnergy);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const performanceMode = usePlayerStore((s) => s.performanceMode);
  const panelOpen = usePlayerStore((s) => s.panelOpen);
  const togglePanel = usePlayerStore((s) => s.togglePanel);

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useLyricSync(audio, lyrics);

  const showControls = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(true);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      showControls();
    } else {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setControlsVisible(true);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isPlaying, showControls]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const events = ['mousemove', 'pointermove', 'touchstart'] as const;
    const handler = () => showControls();
    for (const e of events) {
      el.addEventListener(e, handler);
    }
    return () => {
      for (const e of events) {
        el.removeEventListener(e, handler);
      }
    };
  }, [showControls]);

  const energyRafRef = useRef<number>(0);
  const lastEnergyTick = useRef(0);

  useEffect(() => {
    if (!isPlaying || !getEnergy) return;

    const interval = performanceMode ? 66 : 30;

    const tick = (now: number) => {
      energyRafRef.current = requestAnimationFrame(tick);
      if (now - lastEnergyTick.current < interval) return;
      lastEnergyTick.current = now;

      const data = getEnergy();
      if (data) {
        setAudioEnergy(computeEnergy(data));
      }
    };

    energyRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (energyRafRef.current) cancelAnimationFrame(energyRafRef.current);
    };
  }, [isPlaying, getEnergy, setAudioEnergy, performanceMode]);

  const handlePlay = async () => {
    initAnalyser();
    resumeContext();
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePause = () => {
    audio.pause();
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    seek(time);
  };

  return (
    <div ref={containerRef} className="h-screen w-screen bg-black flex">
      {panelOpen && <ControlPanel audio={audio} />}
      {!panelOpen && (
        <button
          onClick={togglePanel}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900 hover:bg-gray-800 text-gray-400 rounded-r-lg px-1.5 py-6 border border-gray-800 border-l-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1">
          <ThreeStage />
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 flex justify-center transition-all duration-500 ${
            controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="w-full max-w-[800px] px-4 pb-4">
            <PlayerControls
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
