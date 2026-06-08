export type LyricLine = {
  time: number;
  text: string;
};

export type ScannedTrack = {
  id: string;
  title: string;
  artist?: string;
  audioHandle: FileSystemFileHandle;
  lyricHandle?: FileSystemFileHandle;
};

export type AudioEnergy = {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
};

export type BackgroundEffectPreset =
  | 'starDust'
  | 'snowFall'
  | 'blueRain'
  | 'nebulaFlow'
  | 'lightTunnel'
  | 'calmGlow';

export type LyricColorPreset =
  | 'iceBlue'
  | 'warmWhite'
  | 'neonPink'
  | 'goldenDream'
  | 'mintGreen'
  | 'purpleGalaxy';

export type LyricColorTheme = {
  activeColor: string;
  nearColor: string;
  farColor: string;
  glowColor: string;
  secondaryGlowColor: string;
};

export type ImageAlphaMode = 'none' | 'rightFade' | 'edgeFade';

export type TransitionMode = 'cut' | 'crossfade' | 'slide' | 'rotate';

export type BackgroundImageItem = {
  id: string;
  name: string;
  url: string;
  fileType: string;
};

export type VisualSettings = {
  fontSize: number;
  lineGap: number;
  zDepth: number;
  activeScale: number;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  lyricsX: number;
  lyricsY: number;
  lyricsZ: number;
  glowStrength: number;
  bloomIntensity: number;
  particleAmount: number;
  particleStrength: number;
  backgroundBrightness: number;
  vignetteStrength: number;
  backgroundEffectPreset: BackgroundEffectPreset;
  backgroundEffectSpeed: number;
  backgroundEffectAudioReactive: number;
  lyricColorPreset: LyricColorPreset;
  lyricBrightness: number;
  lyricBold: boolean;
  imageFadeStart: number;
  imageFadeEnd: number;
  imageAlphaMode: ImageAlphaMode;
  transitionMode: TransitionMode;
  cycleEnabled: boolean;
  cycleInterval: number;
};

export type RepeatMode = 'none' | 'all' | 'one';

export type Locale = 'zh-CN' | 'en-US';

export type PlayerState = {
  folderName: string | null;
  selectedTrackId: string | null;
  tracks: ScannedTrack[];
  lyrics: LyricLine[];
  backgroundImages: BackgroundImageItem[];
  activeBackgroundImageId: string | null;
  backgroundImageUrl: string | null;
  activeIndex: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  audioEnergy: AudioEnergy;
  settings: VisualSettings;
  performanceMode: boolean;
  panelOpen: boolean;
  locale: Locale;
};
