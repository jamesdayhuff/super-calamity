import { noise, saw, sine, sq, tri } from '../../../assets/audio/recipes';
import type { SfxStep } from '../../../assets/audio/Synth';
import type { SfxEvent } from '../../../assets/audio/events';

/** Clean, bright chiptune: lasers, energy shields, electronic UI. */
export const SPACE_SFX: Record<SfxEvent, SfxStep[]> = {
  // UI
  click: [sq(880, 0.04, 0.12)],
  error: [sq(180, 0.15, 0.15, 0, 110)],
  unlock: [sq(523, 0.07, 0.14), sq(659, 0.07, 0.14, 0.07), sq(784, 0.07, 0.14, 0.14), sq(1047, 0.2, 0.14, 0.21)],

  // Building
  place: [sq(440, 0.06, 0.16), sq(660, 0.09, 0.16, 0.06)],
  upgrade: [sq(523, 0.06, 0.15), sq(659, 0.06, 0.15, 0.06), sq(784, 0.12, 0.15, 0.12)],
  sell: [sq(660, 0.14, 0.14, 0, 300)],

  // Tower attacks
  fire_direct: [sq(1400, 0.07, 0.05, 0, 500)],
  fire_splash: [tri(220, 0.16, 0.25, 0, 70), noise(1200, 0.1, 0.08, 0, 200)],
  fire_slow: [tri(1200, 0.15, 0.07, 0, 1800), noise(6000, 0.2, 0.04, 0, 3000, 'highpass')],
  fire_antishield: [sine(300, 0.12, 0.12, 0, 900), sq(900, 0.1, 0.04, 0.05, 300)],
  fire_sniper: [sq(2000, 0.25, 0.09, 0, 150), noise(5000, 0.25, 0.12, 0, 400)],
  fire_chain: [noise(8000, 0.12, 0.1, 0, 2000, 'bandpass'), saw(1500, 0.1, 0.05, 0, 400)],
  fire_support: [sq(440, 0.06, 0.16), sq(660, 0.09, 0.16, 0.06)],
  boom: [noise(2200, 0.35, 0.22, 0, 90), tri(110, 0.3, 0.25, 0, 40)],

  // Enemies
  hit: [noise(3000, 0.04, 0.04, 0, 1000)],
  shield_hit: [sine(1600, 0.05, 0.04, 0, 1200)],
  shield_break: [sq(1200, 0.2, 0.1, 0, 200), noise(6000, 0.2, 0.08, 0, 1000)],
  death: [sq(400, 0.15, 0.1, 0, 60), noise(3000, 0.15, 0.07, 0, 300)],
  boss_death: [noise(2500, 0.5, 0.25, 0, 80), tri(90, 0.6, 0.3, 0, 30), noise(2000, 0.5, 0.2, 0.25, 60), tri(70, 0.7, 0.3, 0.3, 25)],
  split: [sq(300, 0.08, 0.1, 0, 600), sq(300, 0.08, 0.1, 0.08, 600)],
  heal: [tri(600, 0.2, 0.06, 0, 1200)],
  cloak: [sine(800, 0.2, 0.05, 0, 200)],

  // Flow
  wave_start: [sq(330, 0.1, 0.14), sq(440, 0.1, 0.14, 0.1), sq(660, 0.22, 0.14, 0.2)],
  wave_clear: [sq(523, 0.08, 0.13), sq(659, 0.08, 0.13, 0.08), sq(784, 0.08, 0.13, 0.16), sq(1047, 0.25, 0.13, 0.24)],
  base_hit: [saw(120, 0.3, 0.2, 0, 50), noise(800, 0.3, 0.15, 0, 100)],
  victory: [
    sq(523, 0.15, 0.14),
    sq(659, 0.15, 0.14, 0.15),
    sq(784, 0.15, 0.14, 0.3),
    sq(1047, 0.5, 0.14, 0.45),
    tri(262, 0.95, 0.2),
    tri(392, 0.5, 0.2, 0.45),
  ],
  defeat: [sq(392, 0.25, 0.14), sq(330, 0.25, 0.14, 0.25), sq(262, 0.25, 0.14, 0.5), sq(196, 0.7, 0.14, 0.75, 150), tri(98, 1.4, 0.2)],
};
