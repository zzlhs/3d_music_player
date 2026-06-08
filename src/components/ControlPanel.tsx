import { SongSelector } from './SongSelector';
import { BackgroundImagePicker } from './BackgroundImagePicker';
import { PresetPanel } from './PresetPanel';
import { usePlayerStore, qualitySettings, performanceSettings } from '../store/playerStore';
import { useI18n } from '../i18n/useI18n';
import { Gauge, ChevronLeft, Bold, ChevronDown, ChevronRight, Languages } from 'lucide-react';
import { useState } from 'react';
import type { VisualSettings, Locale } from '../types';

type ControlPanelProps = {
  audio: HTMLAudioElement;
};

function Slider({ label, value, min, max, step, onChange, display }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-[11px] text-gray-600 tabular-nums">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider w-full"
      />
    </div>
  );
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-300 transition w-full text-left"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

const locales: { value: Locale; labelKey: string }[] = [
  { value: 'zh-CN', labelKey: 'language.zhCN' },
  { value: 'en-US', labelKey: 'language.enUS' },
];

export function ControlPanel({ audio }: ControlPanelProps) {
  const settings = usePlayerStore((s) => s.settings);
  const updateSettings = usePlayerStore((s) => s.updateSettings);
  const performanceMode = usePlayerStore((s) => s.performanceMode);
  const togglePerformanceMode = usePlayerStore((s) => s.togglePerformanceMode);
  const togglePanel = usePlayerStore((s) => s.togglePanel);
  const locale = usePlayerStore((s) => s.locale);
  const setLocale = usePlayerStore((s) => s.setLocale);
  const { t } = useI18n();

  const upd = <K extends keyof VisualSettings>(k: K, v: VisualSettings[K]) => updateSettings({ [k]: v });

  return (
    <div className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col shrink-0">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">{t('controlPanel.title')}</h2>
        <button
          onClick={togglePanel}
          className="text-gray-500 hover:text-gray-300 transition p-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={togglePerformanceMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                performanceMode
                  ? 'bg-green-900/40 text-green-400 border border-green-800'
                  : 'bg-orange-900/40 text-orange-400 border border-orange-800'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              {performanceMode ? t('controlPanel.performanceMode') : t('controlPanel.qualityMode')}
            </button>
            <button
              className="text-xs text-gray-600 hover:text-gray-400 transition self-center"
              onClick={() => updateSettings(performanceMode ? { ...performanceSettings } : { ...qualitySettings })}
            >
              {t('controlPanel.resetDefault')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-gray-500" />
          <div className="flex gap-1">
            {locales.map((l) => (
              <button
                key={l.value}
                onClick={() => setLocale(l.value)}
                className={`text-xs px-2 py-0.5 rounded transition ${
                  locale === l.value
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                    : 'text-gray-500 hover:text-gray-300 border border-transparent'
                }`}
              >
                {t(l.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <SongSelector audio={audio} />
        <BackgroundImagePicker />

        <Section title={t('sections.lyrics')} defaultOpen={true}>
          <PresetPanel />
          <Slider label={t('labels.fontSize')} value={settings.fontSize} min={0.1} max={0.5} step={0.01}
            onChange={(v) => upd('fontSize', v)} display={settings.fontSize.toFixed(2)} />
          <Slider label={t('labels.lyricBrightness')} value={settings.lyricBrightness} min={0.3} max={2.5} step={0.1}
            onChange={(v) => upd('lyricBrightness', v)} display={settings.lyricBrightness.toFixed(1)} />
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400">{t('labels.lyricBold')}</label>
            <button
              onClick={() => upd('lyricBold', !settings.lyricBold)}
              className={`p-1.5 rounded-lg transition ${
                settings.lyricBold
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                  : 'text-gray-600 border border-transparent hover:text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
          </div>
          <Slider label={t('labels.lineGap')} value={settings.lineGap} min={0.2} max={0.8} step={0.01}
            onChange={(v) => upd('lineGap', v)} display={settings.lineGap.toFixed(2)} />
          <Slider label={t('labels.zDepth')} value={settings.zDepth} min={0.05} max={0.5} step={0.01}
            onChange={(v) => upd('zDepth', v)} display={settings.zDepth.toFixed(2)} />
          <Slider label={t('labels.activeScale')} value={settings.activeScale} min={1.0} max={1.5} step={0.01}
            onChange={(v) => upd('activeScale', v)} display={settings.activeScale.toFixed(2)} />
          <Slider label={t('labels.lyricsX')} value={settings.lyricsX} min={-4} max={4} step={0.01}
            onChange={(v) => upd('lyricsX', v)} display={settings.lyricsX.toFixed(2)} />
          <Slider label={t('labels.lyricsY')} value={settings.lyricsY} min={-3} max={3} step={0.01}
            onChange={(v) => upd('lyricsY', v)} display={settings.lyricsY.toFixed(2)} />
          <Slider label={t('labels.lyricsZ')} value={settings.lyricsZ} min={-4} max={4} step={0.01}
            onChange={(v) => upd('lyricsZ', v)} display={settings.lyricsZ.toFixed(2)} />
          <Slider label={t('labels.tiltX')} value={settings.tiltX} min={-0.3} max={0.3} step={0.01}
            onChange={(v) => upd('tiltX', v)} display={settings.tiltX.toFixed(2)} />
          <Slider label={t('labels.tiltY')} value={settings.tiltY} min={-1.0} max={0.2} step={0.01}
            onChange={(v) => upd('tiltY', v)} display={settings.tiltY.toFixed(2)} />
          <Slider label={t('labels.tiltZ')} value={settings.tiltZ} min={-0.3} max={0.3} step={0.01}
            onChange={(v) => upd('tiltZ', v)} display={settings.tiltZ.toFixed(2)} />
        </Section>

        <Section title={t('sections.backgroundImage')} defaultOpen={false}>
          <Slider label={t('labels.backgroundBrightness')} value={settings.backgroundBrightness} min={0} max={1} step={0.01}
            onChange={(v) => upd('backgroundBrightness', v)} display={settings.backgroundBrightness.toFixed(2)} />
          <Slider label={t('labels.fadeStart')} value={settings.imageFadeStart} min={0.3} max={1} step={0.05}
            onChange={(v) => upd('imageFadeStart', v)} display={settings.imageFadeStart.toFixed(2)} />
          <Slider label={t('labels.fadeEnd')} value={settings.imageFadeEnd} min={0.5} max={1} step={0.05}
            onChange={(v) => upd('imageFadeEnd', v)} display={settings.imageFadeEnd.toFixed(2)} />
        </Section>

        <Section title={t('sections.effects')} defaultOpen={false}>
          <Slider label={t('labels.particleAmount')} value={settings.particleAmount} min={100} max={1500} step={100}
            onChange={(v) => upd('particleAmount', v)} display={String(settings.particleAmount)} />
          <Slider label={t('labels.particleStrength')} value={settings.particleStrength} min={0} max={2} step={0.1}
            onChange={(v) => upd('particleStrength', v)} display={settings.particleStrength.toFixed(1)} />
          <Slider label={t('labels.effectSpeed')} value={settings.backgroundEffectSpeed} min={0.1} max={3} step={0.1}
            onChange={(v) => upd('backgroundEffectSpeed', v)} display={settings.backgroundEffectSpeed.toFixed(1)} />
          <Slider label={t('labels.audioReactive')} value={settings.backgroundEffectAudioReactive} min={0} max={2} step={0.1}
            onChange={(v) => upd('backgroundEffectAudioReactive', v)} display={settings.backgroundEffectAudioReactive.toFixed(1)} />
          <Slider label={t('labels.glowStrength')} value={settings.glowStrength} min={0} max={3} step={0.1}
            onChange={(v) => upd('glowStrength', v)} display={settings.glowStrength.toFixed(1)} />
          <Slider label={t('labels.bloomIntensity')} value={settings.bloomIntensity} min={0} max={3} step={0.1}
            onChange={(v) => upd('bloomIntensity', v)} display={settings.bloomIntensity.toFixed(1)} />
          <Slider label={t('labels.vignetteStrength')} value={settings.vignetteStrength} min={0} max={1} step={0.01}
            onChange={(v) => upd('vignetteStrength', v)} display={settings.vignetteStrength.toFixed(2)} />
        </Section>

        <button
          onClick={() => {
            if (window.confirm(t('controlPanel.clearConfirm'))) {
              localStorage.removeItem('i-3d-music-player:visual-settings');
              updateSettings(performanceMode ? { ...performanceSettings } : { ...qualitySettings });
            }
          }}
          className="w-full text-xs text-gray-600 hover:text-gray-400 transition py-2 border-t border-gray-800 mt-2"
        >
          {t('controlPanel.clearLocalSettings')}
        </button>
      </div>
    </div>
  );
}
