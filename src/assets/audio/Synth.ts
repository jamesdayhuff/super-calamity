export type Wave = 'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise';

/** One voice of a sound effect. Frequencies in Hz; for noise, f0/f1 drive the filter cutoff. */
export interface SfxStep {
  wave: Wave;
  f0: number;
  f1?: number;
  dur: number;
  vol: number;
  delay?: number;
  filter?: BiquadFilterType;
}

export const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Tiny WebAudio chiptune synth: oscillators and filtered noise with exponential envelopes. */
export class Synth {
  private readonly noiseBuffer: AudioBuffer;

  constructor(private readonly ctx: AudioContext) {
    const len = ctx.sampleRate;
    this.noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  play(steps: SfxStep[], out: AudioNode, when = this.ctx.currentTime): void {
    for (const s of steps) this.voice(s, out, when + (s.delay ?? 0));
  }

  /** Musical note with a short attack and release. */
  note(wave: Wave, freq: number, t0: number, dur: number, vol: number, out: AudioNode): void {
    this.voice({ wave, f0: freq, dur, vol }, out, t0, 0.004);
  }

  private voice(s: SfxStep, out: AudioNode, t0: number, attack = 0.003): void {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    const peak = Math.max(0.0002, s.vol);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(attack + 0.01, s.dur));
    gain.connect(out);

    let src: AudioScheduledSourceNode;
    if (s.wave === 'noise') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = s.filter ?? 'lowpass';
      filter.frequency.setValueAtTime(s.f0, t0);
      if (s.f1) filter.frequency.exponentialRampToValueAtTime(s.f1, t0 + s.dur);
      noise.connect(filter).connect(gain);
      src = noise;
    } else {
      const osc = ctx.createOscillator();
      osc.type = s.wave;
      osc.frequency.setValueAtTime(s.f0, t0);
      if (s.f1) osc.frequency.exponentialRampToValueAtTime(s.f1, t0 + s.dur);
      osc.connect(gain);
      src = osc;
    }
    src.start(t0);
    src.stop(t0 + s.dur + 0.05);
    src.onended = () => gain.disconnect();
  }
}
