import type { EnemyArchetype } from './archetypes';
import type { SpawnGroup, WaveDef } from './types';

/** Spawn group shorthand: enemy, count, seconds between spawns, delay from wave start. */
export const g = (enemy: EnemyArchetype, count: number, interval: number, delay = 0): SpawnGroup => ({
  enemy,
  count,
  interval,
  delay,
});

/** Build a wave list with a linear HP ramp: wave i gets hpMult = base + perWave * i. */
export function rampWaves(base: number, perWave: number, waves: SpawnGroup[][]): WaveDef[] {
  return waves.map((groups, i) => ({ groups, hpMult: +(base + perWave * i).toFixed(3) }));
}
