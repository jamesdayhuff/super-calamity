import type * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import type { EnemyArchetype, TowerArchetype } from '../balance/archetypes';
import { COMBAT } from '../balance/combat';
import type { DamageType, EnemyDef, MapDef, TowerDef } from '../balance/types';
import { COLS, PLAY_Y, ROWS, TILE } from '../constants';
import { TEX } from '../skins/keys';
import { RunState } from '../state/RunState';
import type { DamageResult } from '../systems/DamageModel';
import { sellValue, waveClearCash } from '../systems/Economy';
import { buildGrid, type GridLayout } from '../systems/Grid';
import { Path } from '../systems/Path';
import { WaveRunner } from '../systems/WaveSpawner';
import { Combat } from './Combat';
import type { Effects } from './Effects';
import { Enemy, type EnemyEvent } from './Enemy';
import { Tower } from './Tower';

export type EffectsLike = Pick<Effects, 'beam' | 'ring' | 'bolt' | 'explosion' | 'sparks' | 'floatIcon' | 'floatText'>;

export type UpgradeStatus = { kind: 'max' } | { kind: 'locked' } | { kind: 'ok'; cost: number };

/**
 * The resolved content a run needs. Injected rather than imported so the World stays skin-agnostic
 * and the headless sim can drive any skin.
 */
export interface WorldContent {
  towers: Record<TowerArchetype, TowerDef>;
  enemies: Record<EnemyArchetype, EnemyDef>;
}

/** Scene-level feedback the World can't do itself (camera, banners, scene transitions). All optional. */
export interface WorldHooks {
  onLeak?(e: Enemy): void;
  onBossKilled?(e: Enemy): void;
  onWaveStart?(waveIndex: number, hasBoss: boolean): void;
  onWaveCleared?(wavesCleared: number, bonus: number): void;
  onFinish?(victory: boolean): void;
}

/**
 * The rules of one run: waves, enemies, towers, damage and economy. It holds no input or scene flow,
 * so it runs headless too (see src/sim) with a stub scene and no-op effects.
 */
export class World {
  readonly run: RunState;
  readonly grid: GridLayout;
  readonly path: Path;
  readonly combat: Combat;
  enemies: Enemy[] = [];
  towers: Tower[] = [];
  ended = false;
  private readonly towerGrid: Array<Array<Tower | null>>;
  private waveRunner: WaveRunner | null = null;

  constructor(
    readonly scene: Phaser.Scene,
    readonly map: MapDef,
    readonly content: WorldContent,
    readonly effects: EffectsLike,
    private readonly hooks: WorldHooks = {},
    /** Highest level a tower may reach (meta-progression tier unlocks). */
    private readonly maxLevel: (id: TowerArchetype) => number = () => 3,
  ) {
    this.run = new RunState(map);
    this.grid = buildGrid(map, COLS, ROWS);
    this.path = new Path(map.waypoints.map(([c, r]) => ({ x: c * TILE + TILE / 2, y: PLAY_Y + r * TILE + TILE / 2 })));
    this.towerGrid = Array.from({ length: ROWS }, () => Array<Tower | null>(COLS).fill(null));
    this.combat = new Combat(this);
  }

  update(dt: number): void {
    if (this.ended) return;

    if (this.waveRunner) {
      const hpMult = this.map.waves[this.run.waveIndex].hpMult;
      for (const id of this.waveRunner.update(dt)) this.spawnEnemy(id, 0, hpMult);
    }

    for (const e of this.enemies) {
      if (!e.alive) continue;
      for (const ev of e.update(dt)) this.onEnemyEvent(e, ev);
      if (e.reached && e.alive) this.leak(e);
      if (this.ended) return;
    }

    this.combat.update(dt);
    this.enemies = this.enemies.filter((e) => e.alive);

    if (this.run.phase === 'wave' && this.waveRunner?.done && this.enemies.length === 0) this.waveCleared();
  }

  destroy(): void {
    this.combat.clear();
    this.run.events.clear();
  }

  // ---------------------------------------------------------------- enemies

  spawnEnemy(id: EnemyArchetype, distance: number, hpMult: number): Enemy {
    const e = new Enemy(this.scene, this.content.enemies[id], hpMult, distance, this.path);
    this.enemies.push(e);
    return e;
  }

  damageEnemy(e: Enemy, amount: number, type: DamageType, source?: Tower): DamageResult {
    const r = e.takeDamage(amount, type);
    if (source) source.damageDealt += r.shieldDamage + r.hullDamage;
    if (r.shieldBroken) {
      audio.play('shield_break', 80);
      this.effects.sparks(e.x, e.y, 6, 0x73eff7);
    } else if (r.shieldDamage > 0) {
      audio.play('shield_hit', 90);
    }
    if (r.killed) {
      if (source) source.kills++;
      this.killEnemy(e);
    }
    return r;
  }

  private killEnemy(e: Enemy): void {
    if (!e.alive) return;
    e.destroy();
    this.run.kills++;
    this.run.earn(e.def.bounty);
    if (e.def.boss) {
      this.effects.explosion(e.x, e.y, 2);
      this.effects.sparks(e.x, e.y, 12);
      this.effects.floatText(e.x, e.y - 12, `+${e.def.bounty}`, '#ffcd75');
      audio.play('boss_death', 0);
      this.hooks.onBossKilled?.(e);
    } else {
      this.effects.explosion(e.x, e.y, 0.6);
      audio.play('death', 60);
    }
    for (const a of e.def.abilities ?? []) {
      if (a.type !== 'split') continue;
      audio.play('split', 80);
      for (let i = 0; i < a.count; i++) this.spawnEnemy(a.into, Math.max(0, e.distance - i * COMBAT.splitSpread), e.hpMult);
    }
  }

  private onEnemyEvent(e: Enemy, ev: EnemyEvent): void {
    if (ev === 'cloak') {
      audio.play('cloak', 150);
      return;
    }
    if (ev !== 'heal') return;
    const heal = e.ability('heal');
    if (!heal) return;
    const amount = heal.amount * e.hpMult;
    const r2 = (heal.radius + 4) ** 2;
    for (const o of this.enemies) {
      if (o === e || !o.alive || o.hp >= o.maxHp) continue;
      if ((o.x - e.x) ** 2 + (o.y - e.y) ** 2 <= r2) {
        o.heal(amount);
        this.effects.floatIcon(o.x, o.y - 6, TEX.heal);
      }
    }
    this.effects.ring(e.x, e.y, 3, heal.radius, 0xa7f070, 0.45);
    audio.play('heal', 200);
  }

  private leak(e: Enemy): void {
    e.destroy();
    this.run.damageBase(e.def.baseDamage);
    audio.play('base_hit', 100);
    this.hooks.onLeak?.(e);
    if (this.run.hp <= 0) this.finish(false);
  }

  // ---------------------------------------------------------------- waves

  get currentWaveHasBoss(): boolean {
    const wave = this.map.waves[Math.min(this.run.waveIndex, this.map.waves.length - 1)];
    return wave.groups.some((g) => this.content.enemies[g.enemy].boss);
  }

  startWave(): boolean {
    if (this.run.phase !== 'build' || this.ended) return false;
    this.waveRunner = new WaveRunner(this.map.waves[this.run.waveIndex]);
    this.run.setPhase('wave');
    this.hooks.onWaveStart?.(this.run.waveIndex, this.currentWaveHasBoss);
    return true;
  }

  private waveCleared(): void {
    const bonus = waveClearCash(this.run.waveIndex);
    this.waveRunner = null;
    this.run.wavesCleared++;
    this.run.earn(bonus);
    this.run.waveIndex++;
    if (this.run.wavesCleared >= this.run.totalWaves) {
      this.finish(true);
      return;
    }
    this.run.setPhase('build');
    this.hooks.onWaveCleared?.(this.run.wavesCleared, bonus);
  }

  private finish(victory: boolean): void {
    if (this.ended) return;
    this.ended = true;
    this.run.setPhase(victory ? 'victory' : 'defeat');
    this.hooks.onFinish?.(victory);
  }

  /** Dev cheat: wipe the current wave and count it as cleared. */
  debugClearWave(): void {
    if (this.run.phase !== 'wave') return;
    this.waveRunner = null;
    for (const e of this.enemies) e.destroy();
    this.enemies = [];
    this.waveCleared();
  }

  // ---------------------------------------------------------------- towers

  towerAt(col: number, row: number): Tower | null {
    return this.towerGrid[row]?.[col] ?? null;
  }

  canBuild(col: number, row: number): boolean {
    return col >= 0 && row >= 0 && col < COLS && row < ROWS && this.grid.cells[row][col] === 'build' && !this.towerGrid[row][col];
  }

  buildTower(id: TowerArchetype, col: number, row: number): Tower | null {
    const def = this.content.towers[id];
    if (!this.canBuild(col, row) || !this.run.spend(def.levels[0].cost)) return null;
    const t = new Tower(this.scene, def, col, row);
    this.towers.push(t);
    this.towerGrid[row][col] = t;
    return t;
  }

  upgradeStatus(t: Tower): UpgradeStatus {
    if (t.level >= 3) return { kind: 'max' };
    if (t.level >= this.maxLevel(t.def.id)) return { kind: 'locked' };
    return { kind: 'ok', cost: t.def.levels[t.level].cost };
  }

  upgradeTower(t: Tower): boolean {
    const status = this.upgradeStatus(t);
    if (status.kind !== 'ok' || !this.run.spend(status.cost)) return false;
    t.upgrade();
    return true;
  }

  /** Sell a tower; returns the refund. */
  sellTower(t: Tower): number {
    const refund = sellValue(t.invested);
    this.run.refund(refund);
    this.towerGrid[t.row][t.col] = null;
    this.towers = this.towers.filter((o) => o !== t);
    t.destroy();
    return refund;
  }
}
