import { ECONOMY } from '../balance/economy';
import type { MapDef } from '../balance/types';
import { Emitter } from '../util/Emitter';

export type RunPhase = 'build' | 'wave' | 'victory' | 'defeat';

/** Per-run state. Not persisted; discarded when the run ends. */
export class RunState {
  readonly events = new Emitter<{ change: [] }>();
  cash: number;
  hp: number;
  readonly maxHp = ECONOMY.baseHp;
  /** Index of the current (or next, while building) wave. */
  waveIndex = 0;
  wavesCleared = 0;
  readonly totalWaves: number;
  phase: RunPhase = 'build';
  kills = 0;
  cashEarned = 0;
  leaks = 0;

  constructor(readonly map: MapDef) {
    this.cash = map.startingCash;
    this.hp = this.maxHp;
    this.totalWaves = map.waves.length;
  }

  canAfford(amount: number): boolean {
    return this.cash >= amount;
  }

  spend(amount: number): boolean {
    if (!this.canAfford(amount)) return false;
    this.cash -= amount;
    this.events.emit('change');
    return true;
  }

  earn(amount: number): void {
    this.cash += amount;
    this.cashEarned += amount;
    this.events.emit('change');
  }

  refund(amount: number): void {
    this.cash += amount;
    this.events.emit('change');
  }

  damageBase(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.leaks++;
    this.events.emit('change');
  }

  setPhase(phase: RunPhase): void {
    this.phase = phase;
    this.events.emit('change');
  }

  get isOver(): boolean {
    return this.phase === 'victory' || this.phase === 'defeat';
  }
}
