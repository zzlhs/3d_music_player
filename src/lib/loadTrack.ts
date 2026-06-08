import type { ScannedTrack } from '../types';
import { parseLrc } from './lrc';

export async function loadTrackById(
  audio: HTMLAudioElement,
  tracks: ScannedTrack[],
  trackId: string,
  prevBlobUrl: string | null,
  callbacks: {
    onBlobUrl: (url: string | null) => void;
    selectTrack: (id: string | null) => void;
    setLyrics: (lyrics: import('../types').LyricLine[]) => void;
    setActiveIndex: (i: number) => void;
    setIsPlaying: (p: boolean) => void;
  }
): Promise<string | null> {
  const track = tracks.find((t) => t.id === trackId);
  if (!track) return null;

  if (prevBlobUrl) {
    URL.revokeObjectURL(prevBlobUrl);
  }

  const audioFile = await track.audioHandle.getFile();
  const blobUrl = URL.createObjectURL(audioFile);

  audio.pause();
  audio.src = blobUrl;
  audio.load();

  callbacks.onBlobUrl(blobUrl);
  callbacks.selectTrack(track.id);
  callbacks.setActiveIndex(-1);
  callbacks.setLyrics([]);
  callbacks.setIsPlaying(false);

  if (track.lyricHandle) {
    try {
      const lrcFile = await track.lyricHandle.getFile();
      const lrcText = await lrcFile.text();
      const parsed = parseLrc(lrcText);
      callbacks.setLyrics(parsed);
    } catch {
      // LRC parse failed, continue playing without lyrics
    }
  }

  return blobUrl;
}
