import { useRef, useCallback, useEffect } from 'react';

export function useAudioAnalyser(audio: HTMLAudioElement | null) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAnalyser = useCallback(() => {
    if (!audio || audioContextRef.current) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;
  }, [audio]);

  const resumeContext = useCallback(() => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const getEnergy = useCallback((): Uint8Array | null => {
    if (!analyserRef.current) return null;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    return data;
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        sourceRef.current = null;
        analyserRef.current = null;
      }
    };
  }, []);

  return { initAnalyser, resumeContext, getEnergy, analyserRef };
}
