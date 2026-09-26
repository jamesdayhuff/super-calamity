import type { Wave } from './Synth';

export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  majorPentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
};

/** Percussion voicing. Each skin picks one so the same drum pattern reads differently. */
export type DrumKit = 'electronic' | 'military' | 'western';

/**
 * Generative chiptune track: chords follow `progression` (scale degrees, one per bar), bass and arp
 * are derived from the chord, and a seeded melody is generated in an A A B A' phrase structure.
 */
export interface TrackDef {
  bpm: number;
  /** MIDI note of the tonic (lead octave). */
  root: number;
  scale: number[];
  progression: number[];
  /** 16-step drum pattern: k = kick, s = snare, h = hat, . = rest. */
  drums: string;
  /** 16-step bass pattern: x = play chord root, o = play fifth, . = rest. */
  bass: string;
  lead: Wave;
  arp: boolean;
  /** 0..1 melody note density. */
  density: number;
  seed: number;
  /** Defaults to 'electronic'. */
  kit?: DrumKit;
  /** Defaults to 'triangle'. */
  bassWave?: Wave;
  /** Defaults to 'square'. */
  arpWave?: Wave;
}
