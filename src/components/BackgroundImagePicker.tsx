import { useRef, useMemo } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useI18n } from '../i18n/useI18n';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { Upload, Trash2, ChevronLeft, ChevronRight, Play, Square } from 'lucide-react';
import type { TransitionMode } from '../types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const transitionOptions: { value: TransitionMode; labelKey: string }[] = [
  { value: 'cut', labelKey: 'transition.cut' },
  { value: 'crossfade', labelKey: 'transition.crossfade' },
  { value: 'slide', labelKey: 'transition.slide' },
  { value: 'rotate', labelKey: 'transition.rotate' },
];

export function BackgroundImagePicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const images = usePlayerStore((s) => s.backgroundImages);
  const activeId = usePlayerStore((s) => s.activeBackgroundImageId);
  const addImage = usePlayerStore((s) => s.addBackgroundImage);
  const clearAll = usePlayerStore((s) => s.clearBackgroundImages);
  const setActive = usePlayerStore((s) => s.setActiveBackgroundImageId);
  const settings = usePlayerStore((s) => s.settings);
  const updateSettings = usePlayerStore((s) => s.updateSettings);
  const { createUrl, revokeUrl } = useObjectUrl();
  const { t } = useI18n();

  const activeIndex = useMemo(
    () => images.findIndex((i) => i.id === activeId),
    [images, activeId]
  );

  const handleFiles = (files: FileList) => {
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(t('background.invalidFormat'));
        continue;
      }
      const url = createUrl(file);
      addImage({ id: crypto.randomUUID(), name: file.name, url, fileType: file.type });
    }
  };

  const handleNavigate = (dir: 'prev' | 'next') => {
    if (images.length < 2) return;
    const n = dir === 'next' ? (activeIndex + 1) % images.length : (activeIndex - 1 + images.length) % images.length;
    setActive(images[n].id);
  };

  const handleClearAll = () => {
    for (const img of images) revokeUrl(img.url);
    clearAll();
  };

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{t('background.title')}</label>

      <button
        className="w-full flex items-center gap-2 bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 hover:border-blue-500 text-sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-4 h-4" />
        {t('background.uploadMultiple')}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t('background.imagesCount', { n: images.length })}</span>
            <button onClick={handleClearAll} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleNavigate('prev')}
              disabled={images.length < 2}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-800 rounded py-1.5 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-3 h-3" />
              {t('background.prev')}
            </button>
            <button
              onClick={() => handleNavigate('next')}
              disabled={images.length < 2}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-800 rounded py-1.5 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-30"
            >
              {t('background.next')}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={() => updateSettings({ cycleEnabled: !settings.cycleEnabled })}
              disabled={images.length < 2}
              className={`p-1 rounded ${settings.cycleEnabled ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {settings.cycleEnabled ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>
            <span>{t('background.autoCycle')}</span>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {transitionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSettings({ transitionMode: opt.value })}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  settings.transitionMode === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>

          {settings.cycleEnabled && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-500">{t('background.cycleInterval')}</span>
                <span className="text-[10px] text-gray-600">{settings.cycleInterval}s</span>
              </div>
              <input
                type="range"
                min={3}
                max={60}
                step={1}
                value={settings.cycleInterval}
                onChange={(e) => updateSettings({ cycleInterval: parseInt(e.target.value) })}
                className="slider w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
