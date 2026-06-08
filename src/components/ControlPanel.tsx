import { SongSelector } from './SongSelector';
import { BackgroundImagePicker } from './BackgroundImagePicker';
import { PresetPanel } from './PresetPanel';
import { usePlayerStore, qualitySettings, performanceSettings } from '../store/playerStore';
import { Gauge, ChevronLeft, Bold, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { VisualSettings } from '../types';

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

export function ControlPanel({ audio }: ControlPanelProps) {
  const settings = usePlayerStore((s) => s.settings);
  const updateSettings = usePlayerStore((s) => s.updateSettings);
  const performanceMode = usePlayerStore((s) => s.performanceMode);
  const togglePerformanceMode = usePlayerStore((s) => s.togglePerformanceMode);
  const panelOpen = usePlayerStore((s) => s.panelOpen);
  const togglePanel = usePlayerStore((s) => s.togglePanel);

  if (!panelOpen) return null;

  const upd = <K extends keyof VisualSettings>(k: K, v: VisualSettings[K]) => updateSettings({ [k]: v });

  return (
    <div className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">控制面板</h2>
        <button
          onClick={togglePanel}
          className="text-gray-500 hover:text-gray-300 transition p-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={togglePerformanceMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
              performanceMode
                ? 'bg-green-900/40 text-green-400 border border-green-800'
                : 'bg-orange-900/40 text-orange-400 border border-orange-800'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            {performanceMode ? '性能模式' : '画质模式'}
          </button>
          <button
            className="text-xs text-gray-600 hover:text-gray-400 transition"
            onClick={() => updateSettings(performanceMode ? { ...performanceSettings } : { ...qualitySettings })}
          >
            重置默认
          </button>
        </div>

        <SongSelector audio={audio} />
        <BackgroundImagePicker />

        <Section title="歌词" defaultOpen={true}>
          <PresetPanel />
          <Slider label="字体大小" value={settings.fontSize} min={0.1} max={0.5} step={0.01}
            onChange={(v) => upd('fontSize', v)} display={settings.fontSize.toFixed(2)} />
          <Slider label="歌词亮度" value={settings.lyricBrightness} min={0.3} max={2.5} step={0.1}
            onChange={(v) => upd('lyricBrightness', v)} display={settings.lyricBrightness.toFixed(1)} />
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400">歌词加粗</label>
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
          <Slider label="行距" value={settings.lineGap} min={0.2} max={0.8} step={0.01}
            onChange={(v) => upd('lineGap', v)} display={settings.lineGap.toFixed(2)} />
          <Slider label="Z 轴深度" value={settings.zDepth} min={0.05} max={0.5} step={0.01}
            onChange={(v) => upd('zDepth', v)} display={settings.zDepth.toFixed(2)} />
          <Slider label="当前行缩放" value={settings.activeScale} min={1.0} max={1.5} step={0.01}
            onChange={(v) => upd('activeScale', v)} display={settings.activeScale.toFixed(2)} />
          <Slider label="歌词 X" value={settings.lyricsX} min={-4} max={4} step={0.01}
            onChange={(v) => upd('lyricsX', v)} display={settings.lyricsX.toFixed(2)} />
          <Slider label="歌词 Y" value={settings.lyricsY} min={-3} max={3} step={0.01}
            onChange={(v) => upd('lyricsY', v)} display={settings.lyricsY.toFixed(2)} />
          <Slider label="歌词 Z" value={settings.lyricsZ} min={-4} max={4} step={0.01}
            onChange={(v) => upd('lyricsZ', v)} display={settings.lyricsZ.toFixed(2)} />
          <Slider label="倾斜 X" value={settings.tiltX} min={-0.3} max={0.3} step={0.01}
            onChange={(v) => upd('tiltX', v)} display={settings.tiltX.toFixed(2)} />
          <Slider label="倾斜 Y" value={settings.tiltY} min={-1.0} max={0.2} step={0.01}
            onChange={(v) => upd('tiltY', v)} display={settings.tiltY.toFixed(2)} />
          <Slider label="倾斜 Z" value={settings.tiltZ} min={-0.3} max={0.3} step={0.01}
            onChange={(v) => upd('tiltZ', v)} display={settings.tiltZ.toFixed(2)} />
        </Section>

        <Section title="背景图片" defaultOpen={false}>
          <Slider label="背景亮度" value={settings.backgroundBrightness} min={0} max={1} step={0.01}
            onChange={(v) => upd('backgroundBrightness', v)} display={settings.backgroundBrightness.toFixed(2)} />
          <Slider label="渐变起点" value={settings.imageFadeStart} min={0.3} max={1} step={0.05}
            onChange={(v) => upd('imageFadeStart', v)} display={settings.imageFadeStart.toFixed(2)} />
          <Slider label="渐变终点" value={settings.imageFadeEnd} min={0.5} max={1} step={0.05}
            onChange={(v) => upd('imageFadeEnd', v)} display={settings.imageFadeEnd.toFixed(2)} />
        </Section>

        <Section title="动态特效" defaultOpen={false}>
          <Slider label="粒子数量" value={settings.particleAmount} min={100} max={1500} step={100}
            onChange={(v) => upd('particleAmount', v)} display={String(settings.particleAmount)} />
          <Slider label="粒子强度" value={settings.particleStrength} min={0} max={2} step={0.1}
            onChange={(v) => upd('particleStrength', v)} display={settings.particleStrength.toFixed(1)} />
          <Slider label="特效速度" value={settings.backgroundEffectSpeed} min={0.1} max={3} step={0.1}
            onChange={(v) => upd('backgroundEffectSpeed', v)} display={settings.backgroundEffectSpeed.toFixed(1)} />
          <Slider label="音频响应" value={settings.backgroundEffectAudioReactive} min={0} max={2} step={0.1}
            onChange={(v) => upd('backgroundEffectAudioReactive', v)} display={settings.backgroundEffectAudioReactive.toFixed(1)} />
          <Slider label="发光强度" value={settings.glowStrength} min={0} max={3} step={0.1}
            onChange={(v) => upd('glowStrength', v)} display={settings.glowStrength.toFixed(1)} />
          <Slider label="Bloom 强度" value={settings.bloomIntensity} min={0} max={3} step={0.1}
            onChange={(v) => upd('bloomIntensity', v)} display={settings.bloomIntensity.toFixed(1)} />
          <Slider label="暗角强度" value={settings.vignetteStrength} min={0} max={1} step={0.01}
            onChange={(v) => upd('vignetteStrength', v)} display={settings.vignetteStrength.toFixed(2)} />
        </Section>

        <button
          onClick={() => {
            if (window.confirm('清除本地保存的视觉设置？页面刷新后将使用默认设置。')) {
              localStorage.removeItem('i-3d-music-player:visual-settings');
              updateSettings(performanceMode ? { ...performanceSettings } : { ...qualitySettings });
            }
          }}
          className="w-full text-xs text-gray-600 hover:text-gray-400 transition py-2 border-t border-gray-800 mt-2"
        >
          清除本地设置
        </button>
      </div>
    </div>
  );
}
