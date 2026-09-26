import { describe, expect, it } from 'vitest';
import { buildSchedule, WaveRunner } from '../src/systems/WaveSpawner';
import { g } from '../src/balance/waveHelpers';
import { Path } from '../src/systems/Path';

const wave = { hpMult: 1, groups: [g('scout', 3, 1), g('armored', 2, 2, 0.5)] };

describe('buildSchedule', () => {
  it('flattens groups into time-sorted spawns', () => {
    const s = buildSchedule(wave);
    expect(s.map((e) => [e.time, e.enemy])).toEqual([
      [0, 'scout'],
      [0.5, 'armored'],
      [1, 'scout'],
      [2, 'scout'],
      [2.5, 'armored'],
    ]);
  });
});

describe('WaveRunner', () => {
  it('releases spawns as time advances and reports completion', () => {
    const r = new WaveRunner(wave);
    expect(r.update(0)).toEqual(['scout']);
    expect(r.update(0.6)).toEqual(['armored']);
    expect(r.update(0.5)).toEqual(['scout']);
    expect(r.done).toBe(false);
    expect(r.update(5)).toEqual(['scout', 'armored']);
    expect(r.done).toBe(true);
    expect(r.remaining).toBe(0);
  });
});

describe('Path', () => {
  it('measures length and interpolates positions', () => {
    const p = new Path([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
    ]);
    expect(p.length).toBe(30);
    expect(p.pointAt(5)).toMatchObject({ x: 5, y: 0 });
    expect(p.pointAt(20)).toMatchObject({ x: 10, y: 10 });
    expect(p.pointAt(999)).toMatchObject({ x: 10, y: 20 });
  });
});
