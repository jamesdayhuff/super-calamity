import type { EnemyArchetype } from '../balance/archetypes';
import type { WaveDef } from '../balance/types';

export interface SpawnEvent {
  time: number;
  enemy: EnemyArchetype;
}

/** Flatten a wave's spawn groups into a time-sorted list of spawn events. */
export function buildSchedule(wave: WaveDef): SpawnEvent[] {
  const events: SpawnEvent[] = [];
  for (const group of wave.groups) {
    for (let i = 0; i < group.count; i++) {
      events.push({ time: group.delay + i * group.interval, enemy: group.enemy });
    }
  }
  return events.sort((a, b) => a.time - b.time);
}

/** Steps through a wave's schedule as game time advances. */
export class WaveRunner {
  private readonly schedule: SpawnEvent[];
  private cursor = 0;
  private elapsed = 0;

  constructor(wave: WaveDef) {
    this.schedule = buildSchedule(wave);
  }

  /** Advance by dt seconds; returns enemy ids due to spawn. */
  update(dt: number): EnemyArchetype[] {
    this.elapsed += dt;
    const due: EnemyArchetype[] = [];
    while (this.cursor < this.schedule.length && this.schedule[this.cursor].time <= this.elapsed) {
      due.push(this.schedule[this.cursor++].enemy);
    }
    return due;
  }

  get done(): boolean {
    return this.cursor >= this.schedule.length;
  }

  get remaining(): number {
    return this.schedule.length - this.cursor;
  }
}
