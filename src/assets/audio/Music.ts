import { mulberry32 } from '../../util/rng';
import { midiToFreq, type SfxStep, type Synth } from './Synth';
import type { DrumKit, TrackDef } from './tracks';

/**
 * Percussion voicings. The same 16-step pattern reads as a drum machine, a marching snare or a
 * woodblock-and-stomp depending on the track's kit.
 */
const KITS: Record<DrumKit, Partial<Record<'k' | 's' | 'h', SfxStep[]>>> = {
  electronic: {
    k: [{ wave: 'sine', f0: 160, f1: 40, dur: 0.14, vol: 0.35 }],
    s: [{ wave: 'noise', f0: 1800, dur: 0.1, vol: 0.12, filter: 'bandpass' }],
    h: [{ wave: 'noise', f0: 7000, dur: 0.03, vol: 0.05, filter: 'highpass' }],
  },
  // Deep bass drum and a tight rolling snare.
  military: {
    k: [{ wave: 'sine', f0: 110, f1: 32, dur: 0.22, vol: 0.4 }],
    s: [
      { wave: 'noise', f0: 2600, dur: 0.07, vol: 0.13, filter: 'bandpass' },
      { wave: 'noise', f0: 2400, dur: 0.05, vol: 0.08, delay: 0.045, filter: 'bandpass' },
    ],
    h: [{ wave: 'noise', f0: 5200, dur: 0.025, vol: 0.04, filter: 'highpass' }],
  },
  // Boot stomp, hand clap and a woodblock tick.
  western: {
    k: [{ wave: 'sine', f0: 130, f1: 55, dur: 0.16, vol: 0.32 }],
    s: [{ wave: 'noise', f0: 1400, dur: 0.06, vol: 0.14, filter: 'bandpass' }],
    h: [{ wave: 'square', f0: 2400, f1: 1800, dur: 0.02, vol: 0.05 }],
  },
};

const STEPS_PER_BAR = 16;
const BARS = 8;

interface MelodyNote {
  degree: number;
  steps: number;
}

function degreeToSemis(scale: number[], degree: number): number {
  const len = scale.length;
  const octave = Math.floor(degree / len);
  return scale[((degree % len) + len) % len] + 12 * octave;
}

/** Generate 2-bar phrases and arrange them A A B A' over 8 bars. Index = step within the 8-bar loop. */
export function generateMelody(track: TrackDef): Array<MelodyNote | null> {
  const rand = mulberry32(track.seed);
  const phrase = (startBar: number): Array<MelodyNote | null> => {
    const out: Array<MelodyNote | null> = Array(STEPS_PER_BAR * 2).fill(null);
    let prev = 4;
    for (let s = 0; s < out.length; s++) {
      const beat = s % 4 === 0;
      const eighth = s % 2 === 0;
      const p = beat ? 0.55 + track.density * 0.4 : eighth ? track.density * 0.6 : track.density * 0.2;
      if (rand() > p) continue;
      const chord = track.progression[(startBar + Math.floor(s / STEPS_PER_BAR)) % track.progression.length];
      let degree: number;
      if (beat) degree = chord + [0, 2, 4, 7][Math.floor(rand() * 4)];
      else degree = prev + (rand() < 0.5 ? -1 : 1) * (rand() < 0.8 ? 1 : 2);
      degree = Math.max(-2, Math.min(9, degree));
      prev = degree;
      out[s] = { degree, steps: 1 };
    }
    // Extend each note until the next onset (max 4 steps).
    for (let s = 0; s < out.length; s++) {
      const n = out[s];
      if (!n) continue;
      let len = 1;
      while (len < 4 && s + len < out.length && !out[s + len]) len++;
      n.steps = len;
    }
    return out;
  };
  const a = phrase(0);
  const b = phrase(2);
  const c = phrase(6);
  return [...a, ...a, ...b, ...c];
}

/** Lookahead scheduler that plays a TrackDef on a Synth. */
export class MusicPlayer {
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextTime = 0;
  private step = 0;
  private track: TrackDef | null = null;
  private melody: Array<MelodyNote | null> = [];
  private out: GainNode;

  constructor(
    private readonly ctx: AudioContext,
    private readonly synth: Synth,
    private readonly dest: AudioNode,
  ) {
    this.out = this.freshBus();
  }

  play(track: TrackDef): void {
    this.stop();
    this.track = track;
    this.melody = generateMelody(track);
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.track = null;
    // Fade the old bus out; already-scheduled notes die with it.
    const old = this.out;
    old.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    setTimeout(() => old.disconnect(), 400);
    this.out = this.freshBus();
  }

  private freshBus(): GainNode {
    const g = this.ctx.createGain();
    g.connect(this.dest);
    return g;
  }

  private schedule(): void {
    const track = this.track;
    if (!track) return;
    const stepDur = 60 / track.bpm / 4;
    // If the tab was backgrounded, skip ahead instead of bursting notes.
    if (this.nextTime < this.ctx.currentTime - 0.2) this.nextTime = this.ctx.currentTime + 0.05;
    while (this.nextTime < this.ctx.currentTime + 0.15) {
      this.playStep(track, this.step, this.nextTime, stepDur);
      this.nextTime += stepDur;
      this.step++;
    }
  }

  private playStep(track: TrackDef, step: number, t: number, stepDur: number): void {
    const s16 = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR) % BARS;
    const chord = track.progression[bar % track.progression.length];
    const out = this.out;
    const note = (degree: number, octave: number) =>
      midiToFreq(track.root + octave * 12 + degreeToSemis(track.scale, degree));

    const hit = KITS[track.kit ?? 'electronic'][track.drums[s16] as 'k' | 's' | 'h'];
    if (hit) this.synth.play(hit, out, t);

    const b = track.bass[s16];
    if (b === 'x' || b === 'o') {
      this.synth.note(track.bassWave ?? 'triangle', note(chord + (b === 'o' ? 4 : 0), -2), t, stepDur * 1.8, 0.22, out);
    }

    if (track.arp) {
      const tone = [0, 2, 4, 7][s16 % 4];
      this.synth.note(track.arpWave ?? 'square', note(chord + tone, 0), t, stepDur * 0.8, 0.025, out);
    }

    const m = this.melody[step % this.melody.length];
    if (m) this.synth.note(track.lead, note(m.degree, 0), t, stepDur * m.steps * 0.95, track.lead === 'triangle' ? 0.12 : 0.05, out);
  }
}
