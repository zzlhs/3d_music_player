import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerState, VisualSettings, LyricLine, AudioEnergy, ScannedTrack, RepeatMode, Locale, BackgroundImageItem } from '../types';

export const qualitySettings: VisualSettings = {
  fontSize: 0.23,
  lineGap: 0.42,
  zDepth: 0.18,
  activeScale: 1.18,
  tiltX: 0.08,
  tiltY: -0.55,
  tiltZ: -0.05,
  lyricsX: 2.2,
  lyricsY: 0.2,
  lyricsZ: 0,
  glowStrength: 1.2,
  bloomIntensity: 1.1,
  particleAmount: 1500,
  particleStrength: 0.7,
  backgroundBrightness: 0.82,
  vignetteStrength: 0.45,
  backgroundEffectPreset: 'starDust',
  backgroundEffectSpeed: 1.0,
  backgroundEffectAudioReactive: 0.65,
  lyricColorPreset: 'iceBlue',
  lyricBrightness: 1.8,
  lyricBold: false,
  imageFadeStart: 0.7,
  imageFadeEnd: 0.95,
  imageAlphaMode: 'rightFade',
  transitionMode: 'crossfade',
  cycleEnabled: false,
  cycleInterval: 8,
};

export const performanceSettings: VisualSettings = {
  ...qualitySettings,
  glowStrength: 0.8,
  bloomIntensity: 0.6,
  particleAmount: 600,
  particleStrength: 0.5,
  vignetteStrength: 0.3,
};

type StoreActions = {
  setFolderName: (name: string | null) => void;
  selectTrack: (trackId: string | null) => void;
  setTracks: (tracks: ScannedTrack[]) => void;
  setLyrics: (lyrics: LyricLine[]) => void;
  setBackgroundImageUrl: (url: string | null) => void;
  addBackgroundImage: (item: BackgroundImageItem) => void;
  removeBackgroundImage: (id: string) => void;
  clearBackgroundImages: () => void;
  setActiveBackgroundImageId: (id: string | null) => void;
  setActiveIndex: (index: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setAudioEnergy: (energy: AudioEnergy) => void;
  updateSettings: (partial: Partial<VisualSettings>) => void;
  togglePerformanceMode: () => void;
  togglePanel: () => void;
  setLocale: (locale: Locale) => void;
};

type PersistedSettings = {
  settings: VisualSettings;
  performanceMode: boolean;
  panelOpen: boolean;
  locale: Locale;
};

function clampSettings(s: Partial<VisualSettings>): Partial<VisualSettings> {
  const clamped: Record<string, unknown> = {};
  const range: Record<string, [number, number]> = {
    fontSize: [0.1, 0.5],
    lineGap: [0.2, 0.8],
    zDepth: [0.05, 0.5],
    activeScale: [1.0, 1.5],
    lyricsX: [-4, 4],
    lyricsY: [-3, 3],
    lyricsZ: [-4, 4],
    tiltX: [-0.3, 0.3],
    tiltY: [-1.0, 0.2],
    tiltZ: [-0.3, 0.3],
    glowStrength: [0, 3],
    bloomIntensity: [0, 3],
    particleAmount: [100, 1500],
    particleStrength: [0, 2],
    backgroundBrightness: [0, 1],
    vignetteStrength: [0, 1],
    backgroundEffectSpeed: [0.1, 3],
    backgroundEffectAudioReactive: [0, 2],
    lyricBrightness: [0.3, 2.5],
    imageFadeStart: [0.3, 1],
    imageFadeEnd: [0.5, 1],
    cycleInterval: [3, 60],
  };
  for (const [key, [min, max]] of Object.entries(range)) {
    const val = (s as Record<string, unknown>)[key];
    if (typeof val === 'number' && !isNaN(val)) {
      clamped[key] = Math.max(min, Math.min(max, val));
    }
  }
  return clamped as Partial<VisualSettings>;
}

function detectLocale(): Locale {
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
}

const storageKey = 'i-3d-music-player:visual-settings';

export const usePlayerStore = create<PlayerState & StoreActions>()(
  persist(
    (set) => ({
      folderName: null,
      selectedTrackId: null,
      tracks: [],
      lyrics: [],
      backgroundImages: [],
      activeBackgroundImageId: null,
      backgroundImageUrl: null,
      activeIndex: -1,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      repeatMode: 'none',
      audioEnergy: { bass: 0, mid: 0, treble: 0, overall: 0 },
      settings: { ...performanceSettings },
      performanceMode: true,
      panelOpen: true,
      locale: detectLocale(),

      setFolderName: (folderName) => set({ folderName }),
      selectTrack: (selectedTrackId) => set({ selectedTrackId }),
      setTracks: (tracks) => set({ tracks }),
      setLyrics: (lyrics) => set({ lyrics }),
      setBackgroundImageUrl: (backgroundImageUrl) => set({ backgroundImageUrl }),
      addBackgroundImage: (item) =>
        set((state) => ({
          backgroundImages: [...state.backgroundImages, item],
          activeBackgroundImageId: state.activeBackgroundImageId ?? item.id,
          backgroundImageUrl: state.backgroundImageUrl ?? item.url,
        })),
      removeBackgroundImage: (id) =>
        set((state) => {
          const images = state.backgroundImages.filter((i) => i.id !== id);
          const isActive = state.activeBackgroundImageId === id;
          const newActiveId = isActive ? (images[images.length - 1]?.id ?? null) : state.activeBackgroundImageId;
          const newUrl = newActiveId ? images.find((i) => i.id === newActiveId)?.url ?? null : null;
          return {
            backgroundImages: images,
            activeBackgroundImageId: newActiveId,
            backgroundImageUrl: newUrl,
          };
        }),
      clearBackgroundImages: () => set({ backgroundImages: [], activeBackgroundImageId: null, backgroundImageUrl: null }),
      setActiveBackgroundImageId: (id) =>
        set((state) => ({
          activeBackgroundImageId: id,
          backgroundImageUrl: state.backgroundImages.find((i) => i.id === id)?.url ?? null,
        })),
      setActiveIndex: (activeIndex) => set({ activeIndex }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      setAudioEnergy: (audioEnergy) => set({ audioEnergy }),
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      togglePerformanceMode: () =>
        set((state) => ({
          performanceMode: !state.performanceMode,
          settings: state.performanceMode ? { ...qualitySettings } : { ...performanceSettings },
        })),
      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: storageKey,
      version: 1,
      partialize: (state) => ({
        settings: state.settings,
        performanceMode: state.performanceMode,
        panelOpen: state.panelOpen,
        locale: state.locale,
      }),
      merge: (persisted, current): PlayerState & StoreActions => {
        try {
          const p = persisted as Partial<PersistedSettings> | null;
          if (!p || typeof p !== 'object' || !p.settings) return current;

          const baseSettings = p.performanceMode
            ? { ...performanceSettings }
            : { ...qualitySettings };
          const clamped = clampSettings(p.settings);
          const mergedSettings: VisualSettings = { ...baseSettings, ...clamped };

          return {
            ...current,
            settings: mergedSettings,
            performanceMode: p.performanceMode ?? current.performanceMode,
            panelOpen: p.panelOpen ?? current.panelOpen,
            locale: p.locale ?? current.locale,
          };
        } catch {
          return current;
        }
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn(
            '%c[i-3d-music-player] Failed to restore saved settings, using defaults.',
            'color:#f59e0b'
          );
        } else if (state) {
          console.info(
            '%c[i-3d-music-player] Settings restored from local storage.',
            'color:#34d399'
          );
        }
      },
    }
  )
);
