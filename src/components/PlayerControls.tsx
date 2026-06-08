import { usePlayerStore } from '../store/playerStore';
import { useI18n } from '../i18n/useI18n';
import { Repeat, Repeat1, Play, Pause } from 'lucide-react';
import type { RepeatMode } from '../types';

type PlayerControlsProps = {
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
};

const repeatIcon: Record<RepeatMode, typeof Repeat> = {
  none: Repeat,
  all: Repeat,
  one: Repeat1,
};

const repeatNext: Record<RepeatMode, RepeatMode> = {
  none: 'all',
  all: 'one',
  one: 'none',
};

const repeatTitleKey: Record<RepeatMode, string> = {
  none: 'player.repeatOff',
  all: 'player.repeatAll',
  one: 'player.repeatOne',
};

export function PlayerControls({ onPlay, onPause, onSeek }: PlayerControlsProps) {
  const { isPlaying, currentTime, duration, selectedTrackId, repeatMode, setRepeatMode } =
    usePlayerStore();
  const { t } = useI18n();

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const canPlay = !!selectedTrackId;
  const RepeatIcon = repeatIcon[repeatMode];

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur rounded-xl border border-gray-800/60 shadow-lg">
      <button
        onClick={() => setRepeatMode(repeatNext[repeatMode])}
        className={`p-1.5 rounded-lg transition shrink-0 ${
          repeatMode !== 'none'
            ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
            : 'text-gray-600 hover:text-gray-400 hover:bg-gray-800'
        }`}
        title={t(repeatTitleKey[repeatMode])}
      >
        <RepeatIcon className="w-4 h-4" />
      </button>

      <button
        className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
          canPlay
            ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
        disabled={!canPlay}
        title={isPlaying ? t('player.pause') : t('player.play')}
        onClick={() => {
          if (!canPlay) return;
          if (isPlaying) onPause();
          else onPlay();
        }}
      >
        {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor" />}
      </button>

      <span className="text-gray-400 text-xs tabular-nums min-w-[36px] select-none">
        {formatTime(currentTime)}
      </span>

      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="slider flex-1"
        disabled={!canPlay}
      />

      <span className="text-gray-400 text-xs tabular-nums min-w-[36px] select-none">
        {formatTime(duration)}
      </span>
    </div>
  );
}
