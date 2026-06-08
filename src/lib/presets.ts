import type { LyricColorTheme, BackgroundEffectPreset, LyricColorPreset } from '../types';

export const lyricColorThemes: Record<LyricColorPreset, LyricColorTheme> = {
  iceBlue: {
    activeColor: '#ffffff',
    nearColor: '#dbeafe',
    farColor: '#8ea4c8',
    glowColor: '#93c5fd',
    secondaryGlowColor: '#38bdf8',
  },
  warmWhite: {
    activeColor: '#fffaf0',
    nearColor: '#fdecc8',
    farColor: '#c8a96a',
    glowColor: '#facc15',
    secondaryGlowColor: '#fb923c',
  },
  neonPink: {
    activeColor: '#fff1f8',
    nearColor: '#fbcfe8',
    farColor: '#be6a9d',
    glowColor: '#f472b6',
    secondaryGlowColor: '#a855f7',
  },
  goldenDream: {
    activeColor: '#fff7cc',
    nearColor: '#f8d56b',
    farColor: '#9b7b24',
    glowColor: '#fbbf24',
    secondaryGlowColor: '#f97316',
  },
  mintGreen: {
    activeColor: '#f0fff7',
    nearColor: '#bbf7d0',
    farColor: '#6aa87e',
    glowColor: '#34d399',
    secondaryGlowColor: '#22d3ee',
  },
  purpleGalaxy: {
    activeColor: '#faf5ff',
    nearColor: '#ddd6fe',
    farColor: '#8b7ab8',
    glowColor: '#a78bfa',
    secondaryGlowColor: '#ec4899',
  },
};

export const backgroundEffectLabels: Record<BackgroundEffectPreset, string> = {
  starDust: '星尘漂浮',
  snowFall: '慢速雪点',
  blueRain: '蓝色光雨',
  nebulaFlow: '星云流动',
  lightTunnel: '光隧道',
  calmGlow: '柔和呼吸光',
};

export const lyricColorLabels: Record<LyricColorPreset, string> = {
  iceBlue: '冰蓝',
  warmWhite: '暖白',
  neonPink: '霓虹粉',
  goldenDream: '金色梦',
  mintGreen: '薄荷绿',
  purpleGalaxy: '紫银河',
};
