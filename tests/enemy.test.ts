import { describe, expect, it } from 'vitest';
import type { EnemyArchetype } from '../src/balance/archetypes';
import { ENEMY_STATS } from '../src/balance/enemies';
import { Enemy } from '../src/game/Enemy';
import { Path } from '../src/systems/Path';
import { createStubScene } from '../src/sim/stub';

// These test mechanics, so they read the shared archetypes directly rather than any one skin.
const defOf = (id: EnemyArchetype) => ({ ...ENEMY_STATS[id], id, name: id, sprite: `enemy_${id}` });

const path = new Path([
  { x: 0, y: 0 },
  { x: 10000, y: 0 },
]);
const make = (id: EnemyArchetype, hpMult = 1) => new Enemy(createStubScene(), defOf(id), hpMult, 0, path);

describe('Enemy', () => {
  it('shield does not regenerate while the enemy keeps taking hull damage', () => {
    const e = make('shielded');
    const regenDelay = ENEMY_STATS.shielded.shield!.regenDelay;
    e.takeDamage(1000, 'emp'); // break the shield
    expect(e.shield).toBe(0);
    e.hp = e.maxHp; // keep it alive for the test
    for (let t = 0; t < regenDelay * 3; t += 0.5) {
      e.update(0.5);
      e.takeDamage(1, 'kinetic');
    }
    expect(e.shield).toBe(0);
  });

  it('shield regenerates after being left alone for regenDelay', () => {
    const e = make('shielded');
    const { regenDelay, regenRate } = ENEMY_STATS.shielded.shield!;
    e.takeDamage(1000, 'emp');
    e.hp = e.maxHp;
    // Idle for regenDelay, then ~1s of regeneration, in small ticks.
    for (let t = 0; t < regenDelay + 1; t += 0.1) e.update(0.1);
    expect(e.shield).toBeGreaterThan(regenRate * 0.5);
    expect(e.shield).toBeLessThanOrEqual(regenRate * 1.3);
  });

  it('cloaked enemies are only targetable while revealed', () => {
    const e = make('stealth');
    const cloak = ENEMY_STATS.stealth.abilities!.find((a) => a.type === 'cloak')!;
    expect(e.targetable).toBe(true);
    e.update(cloak.type === 'cloak' ? cloak.visible + 0.01 : 0);
    expect(e.cloaked).toBe(true);
    expect(e.targetable).toBe(false);
    e.revealTimer = 0.25;
    expect(e.targetable).toBe(true);
  });

  it('bosses resist slows', () => {
    const scout = make('scout');
    const boss = make('boss_1');
    scout.applySlow(0.5, 1);
    boss.applySlow(0.5, 1);
    expect(scout.currentSpeed).toBeCloseTo(ENEMY_STATS.scout.speed * 0.5);
    expect(boss.currentSpeed).toBeGreaterThan(ENEMY_STATS.boss_1.speed * 0.5);
  });

  it('scales hp and shield by the wave multiplier', () => {
    const e = make('shielded', 2);
    expect(e.maxHp).toBe(ENEMY_STATS.shielded.hp * 2);
    expect(e.maxShield).toBe(ENEMY_STATS.shielded.shield!.max * 2);
  });
});
