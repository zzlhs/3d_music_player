export type AudioEnergySnapshot = {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
};

export const audioEnergyRef: { current: AudioEnergySnapshot } = {
  current: { bass: 0, mid: 0, treble: 0, overall: 0 },
};
