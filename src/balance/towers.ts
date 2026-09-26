import type { TowerArchetype } from './archetypes';
import type { TowerStats } from './types';

/**
 * Tower mechanics, authored once and shared by every skin. Skins supply names, art, colors and
 * sound; none of them may change a number in here — that is what keeps one balance pass valid
 * across all three worlds.
 */
export const TOWER_STATS: Record<TowerArchetype, TowerStats> = {
  direct: {
    attack: 'beam',
    damageType: 'kinetic',
    levels: [
      { cost: 50, damage: 6, range: 44, fireRate: 2.5 },
      { cost: 45, damage: 10, range: 48, fireRate: 3 },
      { cost: 90, damage: 16, range: 54, fireRate: 3.5 },
    ],
  },
  splash: {
    attack: 'mortar',
    damageType: 'explosive',
    levels: [
      { cost: 80, damage: 18, range: 60, fireRate: 0.55, splashRadius: 20, projectileSpeed: 1.1 },
      { cost: 70, damage: 30, range: 64, fireRate: 0.6, splashRadius: 24, projectileSpeed: 1.1 },
      { cost: 140, damage: 50, range: 72, fireRate: 0.7, splashRadius: 30, projectileSpeed: 1.2 },
    ],
  },
  slow: {
    attack: 'pulse',
    damageType: 'cryo',
    levels: [
      { cost: 60, damage: 2, range: 32, fireRate: 1, slow: { factor: 0.3, duration: 1.5 } },
      { cost: 55, damage: 4, range: 36, fireRate: 1, slow: { factor: 0.45, duration: 1.5 } },
      { cost: 100, damage: 7, range: 42, fireRate: 1.2, slow: { factor: 0.6, duration: 1.8 } },
    ],
  },
  antishield: {
    attack: 'orb',
    damageType: 'emp',
    levels: [
      { cost: 90, damage: 10, range: 48, fireRate: 1, projectileSpeed: 150, splashRadius: 10 },
      { cost: 80, damage: 16, range: 52, fireRate: 1.1, projectileSpeed: 160, splashRadius: 12 },
      { cost: 150, damage: 26, range: 58, fireRate: 1.25, projectileSpeed: 170, splashRadius: 16 },
    ],
  },
  sniper: {
    attack: 'rail',
    damageType: 'kinetic',
    levels: [
      { cost: 120, damage: 60, range: 96, fireRate: 0.4 },
      { cost: 100, damage: 110, range: 110, fireRate: 0.45 },
      { cost: 180, damage: 200, range: 130, fireRate: 0.5, pierce: true },
    ],
  },
  chain: {
    attack: 'chain',
    damageType: 'electric',
    levels: [
      { cost: 110, damage: 12, range: 48, fireRate: 0.9, chain: { targets: 3, falloff: 0.8, jumpRange: 36 } },
      { cost: 100, damage: 18, range: 52, fireRate: 1, chain: { targets: 4, falloff: 0.8, jumpRange: 40 } },
      { cost: 170, damage: 28, range: 56, fireRate: 1.2, chain: { targets: 6, falloff: 0.85, jumpRange: 44 } },
    ],
  },
  support: {
    attack: 'support',
    damageType: 'kinetic',
    levels: [
      { cost: 100, damage: 0, range: 40, fireRate: 0, buff: { fireRate: 0.15, damage: 0.1 }, sensor: true },
      { cost: 90, damage: 0, range: 48, fireRate: 0, buff: { fireRate: 0.25, damage: 0.15 }, sensor: true },
      { cost: 160, damage: 0, range: 56, fireRate: 0, buff: { fireRate: 0.35, damage: 0.25 }, sensor: true },
    ],
  },
};
