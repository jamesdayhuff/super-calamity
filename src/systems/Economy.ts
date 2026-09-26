import { ECONOMY } from '../balance/economy';
import type { MapDef, TowerDef } from '../balance/types';

export interface MetaPayout {
  waves: number;
  clearBonus: number;
  total: number;
  firstClear: boolean;
}

export function computeMetaPayout(
  map: Pick<MapDef, 'metaPerWave' | 'firstClearBonus'>,
  wavesCleared: number,
  victory: boolean,
  firstClear: boolean,
): MetaPayout {
  const waves = Math.max(0, wavesCleared) * map.metaPerWave;
  const clearBonus = !victory
    ? 0
    : firstClear
      ? map.firstClearBonus
      : Math.round(map.firstClearBonus * ECONOMY.replayBonusFactor);
  return { waves, clearBonus, total: waves + clearBonus, firstClear: victory && firstClear };
}

export function waveClearCash(waveIndex: number): number {
  return ECONOMY.waveClearCashBase + ECONOMY.waveClearCashPerWave * waveIndex;
}

/** Total cash spent to build a tower and upgrade it to `level` (1-based). */
export function towerInvestment(def: Pick<TowerDef, 'levels'>, level: number): number {
  return def.levels.slice(0, level).reduce((sum, l) => sum + l.cost, 0);
}

export function sellValue(invested: number): number {
  return Math.floor(invested * ECONOMY.sellRefund);
}
