/**
 * Wave curves, authored once per map slot and shared by every skin. A skin's map at slot N uses
 * WAVE_CURVES[N]; its own layout and pacing come from the waypoints, not from these numbers.
 */
import type { WaveDef } from './types';
import { g, rampWaves } from './waveHelpers';

// Slot 1 — the tutorial map: scouts, armor, swarms. Boss: boss_1.
const SLOT_1 = rampWaves(1.0, 0.07, [
  [g('scout', 8, 1.0)],
  [g('scout', 12, 0.8)],
  [g('scout', 8, 0.8), g('armored', 2, 3, 4)],
  [g('grunt', 20, 0.3)],
  [g('armored', 5, 2.2), g('scout', 8, 0.7, 3)],
  [g('grunt', 25, 0.25), g('scout', 10, 0.6, 5)],
  [g('armored', 8, 1.6)],
  [g('scout', 15, 0.5), g('grunt', 20, 0.25, 4), g('armored', 3, 2, 8)],
  [g('armored', 10, 1.3), g('grunt', 30, 0.2, 6)],
  [g('boss_1', 1, 1), g('scout', 12, 0.7, 2), g('armored', 4, 2, 6)],
]);

// Slot 2 — introduces shielded enemies. Boss: boss_2 (shielded).
const SLOT_2 = rampWaves(1.15, 0.07, [
  [g('scout', 10, 0.9)],
  [g('shielded', 3, 2.5)],
  [g('grunt', 25, 0.25), g('shielded', 2, 2, 5)],
  [g('armored', 5, 1.8), g('scout', 10, 0.6, 3)],
  [g('shielded', 6, 1.7)],
  [g('grunt', 30, 0.2), g('armored', 4, 2, 4)],
  [g('shielded', 6, 1.4), g('scout', 15, 0.5, 2)],
  [g('armored', 8, 1.3), g('shielded', 5, 1.6, 5)],
  [g('grunt', 40, 0.18), g('shielded', 6, 1.5, 3)],
  [g('shielded', 12, 1.1)],
  [g('armored', 10, 1.1), g('shielded', 8, 1.2, 4), g('grunt', 20, 0.2, 8)],
  [g('boss_2', 1, 1), g('shielded', 8, 1.5, 3), g('scout', 15, 0.5, 6)],
]);

// Slot 3 — introduces splitters and stealth. Boss: boss_3 (splitting).
const SLOT_3 = rampWaves(1.2, 0.078, [
  [g('scout', 14, 0.6)],
  [g('splitter', 5, 2)],
  [g('stealth', 5, 1.8)],
  [g('shielded', 4, 1.8), g('splitter', 3, 2, 5)],
  [g('grunt', 35, 0.18), g('stealth', 4, 1.5, 4)],
  [g('splitter', 8, 1.5)],
  [g('armored', 8, 1.3), g('stealth', 6, 1.4, 3)],
  [g('shielded', 10, 1.2), g('grunt', 25, 0.2, 4)],
  [g('splitter', 12, 1), g('stealth', 6, 1.2, 5)],
  [g('armored', 10, 1.1), g('shielded', 8, 1.2, 3)],
  [g('stealth', 14, 0.9)],
  [g('splitter', 14, 0.9), g('grunt', 40, 0.15, 5)],
  [g('armored', 12, 1), g('shielded', 10, 1, 3), g('stealth', 8, 1, 8)],
  [g('boss_3', 1, 1), g('stealth', 8, 1.2, 3), g('splitter', 8, 1.2, 6)],
]);

// Slot 4 — introduces healers. Boss: boss_4 (shielded + healing).
const SLOT_4 = rampWaves(1.3, 0.085, [
  [g('scout', 16, 0.55)],
  [g('armored', 6, 1.6), g('healer', 3, 3, 1)],
  [g('shielded', 8, 1.3), g('healer', 2, 3, 3)],
  [g('splitter', 10, 1.2), g('grunt', 30, 0.18, 4)],
  [g('stealth', 10, 1.1), g('healer', 3, 2.5, 3)],
  [g('armored', 12, 1.1), g('healer', 4, 2.5, 2)],
  [g('grunt', 50, 0.14)],
  [g('shielded', 12, 1), g('healer', 4, 2, 4)],
  [g('splitter', 14, 0.9), g('stealth', 8, 1, 4)],
  [g('armored', 14, 0.9), g('healer', 6, 2, 3)],
  [g('shielded', 14, 0.9), g('grunt', 40, 0.14, 5)],
  [g('stealth', 16, 0.8), g('healer', 5, 2, 3)],
  [g('splitter', 18, 0.8), g('armored', 8, 1, 5)],
  [g('shielded', 16, 0.8), g('healer', 8, 1.6, 2)],
  [g('armored', 16, 0.8), g('stealth', 12, 0.8, 4), g('grunt', 40, 0.12, 8)],
  [g('boss_4', 1, 1), g('healer', 6, 2, 3), g('shielded', 12, 1, 5)],
]);

// Slot 5 — everything, plus mid-bosses. Boss: boss_5 (stealth + shielded + healing).
const SLOT_5 = rampWaves(1.4, 0.09, [
  [g('scout', 20, 0.45)],
  [g('armored', 8, 1.3), g('healer', 2, 2.5, 3)],
  [g('shielded', 6, 1.4), g('grunt', 30, 0.15, 4)],
  [g('splitter', 10, 1.1), g('stealth', 5, 1.2, 4)],
  [g('healer', 6, 1.6), g('armored', 10, 1, 1)],
  [g('grunt', 60, 0.1)],
  [g('stealth', 14, 0.8), g('shielded', 8, 1, 4)],
  [g('splitter', 16, 0.8), g('healer', 5, 2, 3)],
  [g('armored', 16, 0.8), g('shielded', 10, 0.9, 4)],
  [g('boss_1', 1, 1), g('grunt', 40, 0.15, 4)],
  [g('stealth', 18, 0.7), g('healer', 6, 1.8, 3)],
  [g('shielded', 18, 0.75), g('splitter', 10, 1, 5)],
  [g('grunt', 80, 0.08), g('armored', 10, 1, 3)],
  [g('splitter', 20, 0.7), g('stealth', 12, 0.8, 4)],
  [g('boss_2', 1, 1), g('shielded', 12, 0.9, 3), g('healer', 6, 1.6, 6)],
  [g('armored', 22, 0.65), g('healer', 8, 1.5, 2)],
  [g('stealth', 20, 0.6), g('shielded', 16, 0.7, 5)],
  [g('splitter', 24, 0.6), g('grunt', 60, 0.1, 5)],
  [g('boss_4', 1, 1), g('armored', 16, 0.7, 3), g('stealth', 14, 0.7, 8)],
  [g('boss_5', 1, 1), g('shielded', 14, 0.8, 4), g('healer', 8, 1.5, 6), g('stealth', 14, 0.7, 10)],
]);

/** One curve per map slot, in map order. Every skin ships exactly MAP_SLOTS maps. */
export const WAVE_CURVES: WaveDef[][] = [SLOT_1, SLOT_2, SLOT_3, SLOT_4, SLOT_5];
