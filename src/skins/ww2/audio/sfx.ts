import { noise, saw, sine, sq, tri } from '../../../assets/audio/recipes';
import type { SfxEvent } from '../../../assets/audio/events';
import type { SfxStep } from '../../../assets/audio/Synth';

/** Heavier and grittier than Space: cordite cracks, bolt actions, low artillery thump. */
export const WW2_SFX: Record<SfxEvent, SfxStep[]> = {
  // UI — clipped and mechanical, like a field telephone.
  click: [sq(520, 0.03, 0.11), noise(2600, 0.02, 0.04, 0.01, 1400, 'highpass')],
  error: [saw(150, 0.18, 0.15, 0, 80)],
  unlock: [tri(392, 0.09, 0.15), tri(523, 0.09, 0.15, 0.09), tri(659, 0.22, 0.15, 0.18)],

  // Building — digging in.
  place: [noise(900, 0.09, 0.16, 0, 240, 'lowpass'), tri(180, 0.1, 0.16, 0.03, 120)],
  upgrade: [tri(330, 0.07, 0.15), tri(440, 0.07, 0.15, 0.07), tri(587, 0.14, 0.15, 0.14)],
  sell: [noise(700, 0.14, 0.12, 0, 180, 'lowpass')],

  // Tower attacks
  fire_direct: [noise(2400, 0.05, 0.1, 0, 700), sq(320, 0.04, 0.05, 0, 180)],
  fire_splash: [tri(150, 0.2, 0.28, 0, 45), noise(900, 0.12, 0.1, 0, 160, 'lowpass')],
  fire_slow: [noise(600, 0.18, 0.12, 0, 90, 'lowpass'), tri(120, 0.16, 0.14, 0, 60)],
  fire_antishield: [noise(3600, 0.07, 0.13, 0, 900), saw(420, 0.08, 0.07, 0, 150)],
  fire_sniper: [noise(5200, 0.22, 0.16, 0, 300), tri(160, 0.22, 0.2, 0, 50)],
  fire_chain: [noise(1800, 0.3, 0.12, 0, 600, 'bandpass'), saw(700, 0.28, 0.06, 0, 240)],
  fire_support: [sine(760, 0.05, 0.08, 0, 640), sine(640, 0.06, 0.07, 0.06, 760)],
  boom: [noise(1600, 0.4, 0.24, 0, 70, 'lowpass'), tri(90, 0.36, 0.28, 0, 30)],

  // Enemies
  hit: [noise(2400, 0.04, 0.05, 0, 800)],
  shield_hit: [noise(3000, 0.05, 0.06, 0, 1600, 'bandpass')],
  shield_break: [noise(2000, 0.24, 0.13, 0, 300), tri(200, 0.2, 0.1, 0, 90)],
  death: [noise(1800, 0.16, 0.09, 0, 200), tri(220, 0.14, 0.08, 0, 70)],
  boss_death: [noise(1400, 0.6, 0.26, 0, 50, 'lowpass'), tri(70, 0.8, 0.3, 0, 24), noise(1100, 0.5, 0.2, 0.3, 40), tri(58, 0.9, 0.28, 0.35, 20)],
  split: [noise(1200, 0.1, 0.1, 0, 400), noise(1200, 0.1, 0.09, 0.09, 400)],
  heal: [sine(520, 0.22, 0.07, 0, 780)],
  cloak: [noise(1600, 0.26, 0.05, 0, 300, 'lowpass')],

  // Flow — bugle calls and artillery.
  wave_start: [tri(392, 0.13, 0.16), tri(523, 0.13, 0.16, 0.13), tri(659, 0.28, 0.16, 0.26)],
  wave_clear: [tri(523, 0.1, 0.15), tri(659, 0.1, 0.15, 0.1), tri(784, 0.3, 0.15, 0.2)],
  base_hit: [tri(90, 0.36, 0.24, 0, 36), noise(600, 0.34, 0.16, 0, 80, 'lowpass')],
  victory: [
    tri(392, 0.16, 0.16),
    tri(523, 0.16, 0.16, 0.16),
    tri(659, 0.16, 0.16, 0.32),
    tri(784, 0.55, 0.16, 0.48),
    sq(196, 1, 0.1),
  ],
  defeat: [tri(330, 0.3, 0.15), tri(262, 0.3, 0.15, 0.3), tri(196, 0.3, 0.15, 0.6), tri(147, 0.9, 0.15, 0.9, 100), saw(73, 1.5, 0.16)],
};
