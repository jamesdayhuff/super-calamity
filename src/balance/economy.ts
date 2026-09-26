import type { TowerArchetype } from './archetypes';

export const ECONOMY = {
  baseHp: 20,
  /** Fraction of total invested cash returned on sell. */
  sellRefund: 0.7,
  /** In-run cash awarded for clearing a wave: base + perWave * waveIndex. */
  waveClearCashBase: 30,
  waveClearCashPerWave: 4,
  /** Fraction of a map's first-clear bonus paid on repeat victories. */
  replayBonusFactor: 0.25,
};

/** Meta-progression costs. Shared by every skin; only the currency's *name* is per-skin. */
export const META = {
  startingTowers: ['direct', 'splash', 'slow'] as TowerArchetype[],
  /** One-time meta cost to unlock a tower type. Starting towers are free. */
  towerUnlockCost: {
    direct: 0,
    splash: 0,
    slow: 0,
    antishield: 25,
    sniper: 35,
    chain: 55,
    support: 70,
  } as Record<TowerArchetype, number>,
  /** One-time meta cost to unlock level 3 of a tower. */
  tierUnlockCost: {
    direct: 15,
    splash: 20,
    slow: 20,
    antishield: 25,
    sniper: 30,
    chain: 35,
    support: 40,
  } as Record<TowerArchetype, number>,
};
