import { useRef, useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useMusicFolder } from '../hooks/useMusicFolder';
import { loadTrackById } from '../lib/loadTrack';
import type { ScannedTrack } from '../types';
import { FolderOpen, Music, FileAudio } from 'lucide-react';

type SongSelectorProps = {
  audio: HTMLAudioElement;
};

export function SongSelector({ audio }: SongSelectorProps) {
  const { tracks, folderName, pickFolder } = useMusicFolder();
  const {
    selectedTrackId,
    selectTrack,
    setLyrics,
    setActiveIndex,
    setIsPlaying,
    setTracks,
  } = usePlayerStore();

  const blobUrlRef = useRef<string | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  useEffect(() => {
    setTracks(tracks);
  }, [tracks, setTracks]);

  const handleSelectTrack = async (track: ScannedTrack) => {
    setLoadingTrack(true);
    try {
      const oldUrl = blobUrlRef.current;
      blobUrlRef.current = null;
      const url = await loadTrackById(audio, tracks, track.id, oldUrl, {
        onBlobUrl: (u) => { blobUrlRef.current = u; },
        selectTrack,
        setLyrics,
        setActiveIndex,
        setIsPlaying,
      });
      blobUrlRef.current = url;
    } catch (err) {
      console.error('Failed to load track:', err);
    } finally {
      setLoadingTrack(false);
    }
  };

  return (
    <div>
      <button
        onClick={pickFolder}
        className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-2.5 text-sm font-medium transition"
      >
        <FolderOpen className="w-4 h-4" />
        {folderName ? `更换文件夹` : `选择音乐文件夹`}
      </button>

      {folderName && (
        <p className="text-xs text-gray-400 mt-1 truncate">
          已选择: {folderName}
        </p>
      )}

      {tracks.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <FileAudio className="w-3.5 h-3.5" />
            <span>{tracks.length} 首歌曲</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                disabled={loadingTrack}
                className={`w-full text-left flex items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                  selectedTrackId === track.id
                    ? 'bg-blue-600/30 text-blue-300'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Music className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{track.title}</span>
                {track.lyricHandle && (
                  <span className="text-[10px] text-green-500 ml-auto shrink-0">LRC</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
