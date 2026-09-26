import type { SfxStep } from './Synth';

/** Shorthand builders shared by every skin's sfx table. */
export const sq = (f0: number, dur: number, vol: number, delay = 0, f1?: number): SfxStep => ({
  wave: 'square',
  f0,
  f1,
  dur,
  vol,
  delay,
});
export const tri = (f0: number, dur: number, vol: number, delay = 0, f1?: number): SfxStep => ({
  wave: 'triangle',
  f0,
  f1,
  dur,
  vol,
  delay,
});
export const saw = (f0: number, dur: number, vol: number, delay = 0, f1?: number): SfxStep => ({
  wave: 'sawtooth',
  f0,
  f1,
  dur,
  vol,
  delay,
});
export const sine = (f0: number, dur: number, vol: number, delay = 0, f1?: number): SfxStep => ({
  wave: 'sine',
  f0,
  f1,
  dur,
  vol,
  delay,
});
export const noise = (
  f0: number,
  dur: number,
  vol: number,
  delay = 0,
  f1?: number,
  filter?: BiquadFilterType,
): SfxStep => ({ wave: 'noise', f0, f1, dur, vol, delay, filter });
