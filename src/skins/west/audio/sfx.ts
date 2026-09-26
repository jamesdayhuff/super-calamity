import { noise, saw, sine, sq, tri } from '../../../assets/audio/recipes';
import type { SfxEvent } from '../../../assets/audio/events';
import type { SfxStep } from '../../../assets/audio/Synth';

/** Dry and twangy: cracked rifle reports, ricochets, spur-jingle UI. */
export const WEST_SFX: Record<SfxEvent, SfxStep[]> = {
  // UI — spurs and hammer clicks.
  click: [tri(1320, 0.03, 0.1, 0, 1760)],
  error: [tri(200, 0.16, 0.14, 0, 130), noise(600, 0.08, 0.05, 0, 200, 'lowpass')],
  unlock: [tri(587, 0.07, 0.14), tri(784, 0.07, 0.14, 0.07), tri(988, 0.07, 0.14, 0.14), tri(1175, 0.24, 0.14, 0.21)],

  // Building — hammer and nails.
  place: [noise(1400, 0.05, 0.14, 0, 500), tri(300, 0.07, 0.14, 0.04, 200)],
  upgrade: [tri(587, 0.06, 0.14), tri(784, 0.06, 0.14, 0.06), tri(988, 0.14, 0.14, 0.12)],
  sell: [tri(880, 0.14, 0.12, 0, 330), sine(1320, 0.1, 0.05, 0.05, 660)],

  // Tower attacks
  fire_direct: [noise(3200, 0.05, 0.1, 0, 500), sq(420, 0.03, 0.05, 0, 160)],
  fire_splash: [noise(1200, 0.16, 0.24, 0, 80, 'lowpass'), tri(140, 0.18, 0.22, 0, 40)],
  fire_slow: [sine(320, 0.22, 0.1, 0, 90), noise(500, 0.2, 0.06, 0, 120, 'lowpass')],
  fire_antishield: [noise(2000, 0.1, 0.16, 0, 240), tri(180, 0.12, 0.14, 0, 60)],
  fire_sniper: [noise(6000, 0.26, 0.14, 0, 260), sine(900, 0.3, 0.07, 0.02, 200)],
  // A ricochet whine, which is what chaining sounds like out here.
  fire_chain: [sine(2400, 0.12, 0.09, 0, 700), sine(1800, 0.14, 0.07, 0.08, 500), noise(4000, 0.08, 0.05, 0, 1200, 'bandpass')],
  fire_support: [tri(1046, 0.16, 0.09, 0, 1046), tri(1568, 0.2, 0.06, 0.08, 1568)],
  boom: [noise(1800, 0.34, 0.24, 0, 80, 'lowpass'), tri(100, 0.3, 0.26, 0, 34)],

  // Enemies
  hit: [noise(3400, 0.04, 0.04, 0, 1100)],
  shield_hit: [sine(2000, 0.06, 0.05, 0, 1400)],
  shield_break: [noise(3000, 0.2, 0.11, 0, 500), tri(300, 0.18, 0.09, 0, 110)],
  death: [tri(360, 0.14, 0.09, 0, 80), noise(2200, 0.12, 0.06, 0, 300)],
  boss_death: [noise(1600, 0.55, 0.24, 0, 60, 'lowpass'), tri(80, 0.75, 0.3, 0, 26), noise(1300, 0.5, 0.18, 0.28, 50), tri(64, 0.9, 0.26, 0.32, 22)],
  split: [tri(420, 0.08, 0.1, 0, 760), tri(420, 0.08, 0.09, 0.08, 760)],
  heal: [tri(700, 0.2, 0.06, 0, 1046)],
  cloak: [noise(1200, 0.22, 0.05, 0, 260, 'lowpass')],

  // Flow — harmonica-ish intervals.
  wave_start: [tri(440, 0.12, 0.14), tri(587, 0.12, 0.14, 0.12), tri(880, 0.26, 0.14, 0.24)],
  wave_clear: [tri(587, 0.08, 0.13), tri(740, 0.08, 0.13, 0.08), tri(880, 0.08, 0.13, 0.16), tri(1175, 0.26, 0.13, 0.24)],
  base_hit: [saw(140, 0.3, 0.2, 0, 60), noise(900, 0.28, 0.14, 0, 120, 'lowpass')],
  victory: [
    tri(440, 0.15, 0.15),
    tri(587, 0.15, 0.15, 0.15),
    tri(740, 0.15, 0.15, 0.3),
    tri(880, 0.5, 0.15, 0.45),
    sq(220, 0.95, 0.09),
    sq(330, 0.5, 0.09, 0.45),
  ],
  defeat: [tri(440, 0.26, 0.14), tri(370, 0.26, 0.14, 0.26), tri(294, 0.26, 0.14, 0.52), tri(220, 0.8, 0.14, 0.78, 160), saw(110, 1.4, 0.15)],
};
