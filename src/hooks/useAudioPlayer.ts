import { useRef, useCallback, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { loadTrackById } from '../lib/loadTrack';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
  }

  const audio = audioRef.current;

  const seek = useCallback((time: number) => {
    audio.currentTime = time;
  }, [audio]);

  useEffect(() => {
    const { setIsPlaying, setDuration } = usePlayerStore.getState();
    const onDuration = () => setDuration(audio.duration);
    const onEnded = async () => {
      const state = usePlayerStore.getState();
      const mode = state.repeatMode;

      if (mode === 'one') {
        audio.currentTime = 0;
        try {
          await audio.play();
        } catch {
          setIsPlaying(false);
        }
        return;
      }

      if (mode === 'all' && state.tracks.length > 0) {
        const currentIdx = state.tracks.findIndex((t) => t.id === state.selectedTrackId);
        if (currentIdx >= 0) {
          const nextIdx = (currentIdx + 1) % state.tracks.length;
          const nextTrack = state.tracks[nextIdx];
          if (nextTrack) {
            await loadTrackById(audio, state.tracks, nextTrack.id, null, {
              onBlobUrl: () => {},
              selectTrack: state.selectTrack,
              setLyrics: state.setLyrics,
              setActiveIndex: state.setActiveIndex,
              setIsPlaying: state.setIsPlaying,
            });
            try {
              await audio.play();
              usePlayerStore.getState().setIsPlaying(true);
            } catch {
              usePlayerStore.getState().setIsPlaying(false);
            }
            return;
          }
        }
      }

      setIsPlaying(false);
    };
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audio]);

  useEffect(() => {
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audio]);

  return { audio, seek };
}
