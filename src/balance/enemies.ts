import type { EnemyArchetype } from './archetypes';
import type { EnemyStats } from './types';

/**
 * Enemy mechanics, authored once and shared by every skin. `boss_1`..`boss_5` are the five boss
 * slots in map order; map 5 reuses the earlier ones as mid-bosses.
 */
export const ENEMY_STATS: Record<EnemyArchetype, EnemyStats> = {
  scout: { hp: 22, speed: 48, bounty: 4, baseDamage: 1, radius: 5 },
  armored: { hp: 110, speed: 22, bounty: 10, baseDamage: 2, radius: 7 },
  grunt: { hp: 9, speed: 40, bounty: 1, baseDamage: 1, radius: 4 },
  shielded: {
    hp: 40,
    speed: 28,
    bounty: 9,
    baseDamage: 2,
    shield: { max: 45, regenDelay: 2, regenRate: 10 },
    radius: 7,
  },
  splitter: {
    hp: 70,
    speed: 30,
    bounty: 6,
    baseDamage: 2,
    abilities: [{ type: 'split', into: 'splitling', count: 2 }],
    radius: 7,
  },
  splitling: { hp: 24, speed: 44, bounty: 2, baseDamage: 1, radius: 4, spawnOnly: true },
  healer: {
    hp: 60,
    speed: 30,
    bounty: 8,
    baseDamage: 1,
    abilities: [{ type: 'heal', radius: 40, amount: 12, interval: 2.5 }],
    radius: 6,
  },
  stealth: {
    hp: 50,
    speed: 36,
    bounty: 8,
    baseDamage: 2,
    abilities: [{ type: 'cloak', visible: 2.5, cloaked: 2 }],
    radius: 6,
  },

  // ---- Bosses: one archetype per map slot, differing by ability combination ----
  boss_1: { hp: 1400, speed: 14, bounty: 120, baseDamage: 10, slowResist: 0.5, radius: 11, boss: true },
  boss_2: {
    hp: 1300,
    speed: 14,
    bounty: 150,
    baseDamage: 10,
    slowResist: 0.5,
    shield: { max: 600, regenDelay: 3, regenRate: 30 },
    radius: 11,
    boss: true,
  },
  boss_3: {
    hp: 1800,
    speed: 13,
    bounty: 180,
    baseDamage: 12,
    slowResist: 0.5,
    abilities: [{ type: 'split', into: 'splitter', count: 4 }],
    radius: 11,
    boss: true,
  },
  boss_4: {
    hp: 3200,
    speed: 13,
    bounty: 220,
    baseDamage: 15,
    slowResist: 0.6,
    shield: { max: 1200, regenDelay: 3, regenRate: 35 },
    abilities: [{ type: 'heal', radius: 56, amount: 40, interval: 3 }],
    radius: 11,
    boss: true,
  },
  boss_5: {
    hp: 3400,
    speed: 12,
    bounty: 300,
    baseDamage: 20,
    slowResist: 0.6,
    shield: { max: 1100, regenDelay: 3, regenRate: 45 },
    abilities: [
      { type: 'heal', radius: 56, amount: 50, interval: 3 },
      { type: 'cloak', visible: 5, cloaked: 2 },
    ],
    radius: 12,
    boss: true,
  },
};
