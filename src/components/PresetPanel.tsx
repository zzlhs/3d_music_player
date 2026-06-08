import { usePlayerStore } from '../store/playerStore';
import { useI18n } from '../i18n/useI18n';
import { getEffectLabel, getColorLabel } from '../i18n/messages';
import type { BackgroundEffectPreset, LyricColorPreset } from '../types';

export function PresetPanel() {
  const settings = usePlayerStore((s) => s.settings);
  const updateSettings = usePlayerStore((s) => s.updateSettings);
  const locale = usePlayerStore((s) => s.locale);
  const { t } = useI18n();

  const effectPresets: BackgroundEffectPreset[] = [
    'starDust', 'snowFall', 'blueRain', 'nebulaFlow', 'lightTunnel', 'calmGlow',
  ];

  const colorPresets: LyricColorPreset[] = [
    'iceBlue', 'warmWhite', 'neonPink', 'goldenDream', 'mintGreen', 'purpleGalaxy',
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">{t('effects.title')}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {effectPresets.map((preset) => (
            <button
              key={preset}
              className={`text-xs rounded px-2 py-1.5 transition ${
                settings.backgroundEffectPreset === preset
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => updateSettings({ backgroundEffectPreset: preset })}
            >
              {getEffectLabel(preset, locale)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">{t('colors.title')}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {colorPresets.map((preset) => (
            <button
              key={preset}
              className={`text-xs rounded px-2 py-1.5 transition ${
                settings.lyricColorPreset === preset
                  ? 'ring-2 ring-blue-500 bg-gray-800 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => updateSettings({ lyricColorPreset: preset })}
            >
              {getColorLabel(preset, locale)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
