import type { TowerArchetype } from '../balance/archetypes';
import type { MapDef } from '../balance/types';
import { PLAY_Y, TILE } from '../constants';
import { World, type WorldContent } from '../game/World';
import { getSkin } from '../skins/registry';
import { DEFAULT_SKIN } from '../skins/registry';
import { createStubEffects, createStubScene } from './stub';

/**
 * Reference bot for balance checks: builds towers from a fixed rotation on the cells with the most
 * path coverage, upgrades when it has spare cash, and sends waves as soon as it's done spending.
 * It's deliberately simple — a human who adapts to the enemy mix should do better.
 */
export interface BotPlan {
  rotation: TowerArchetype[];
  /** Towers whose level-3 tier has been bought in the upgrade shop by this point. */
  tiers: TowerArchetype[];
}

export interface SimResult {
  map: string;
  victory: boolean;
  hp: number;
  wavesCleared: number;
  totalWaves: number;
  leaksByWave: number[];
  /** Base HP remaining after each wave. */
  hpByWave: number[];
  /** Enemy ids that reached the base, per wave. */
  leakedIds: string[][];
  towers: number;
  cashLeft: number;
}

/**
 * Loadouts mirror what first clears can afford in the upgrade shop by each map slot (no farming):
 * slot 1 starting kit; slot 2 +antishield & direct L3 (40 meta); slot 3 +chain (~106); slot 4
 * +sniper & more tiers (~188); slot 5 everything plus most tiers (~300).
 *
 * Indexed by map slot, not by skin — balance is shared, so one plan per slot covers every world.
 */
export const BOT_PLANS: BotPlan[] = [
  { rotation: ['direct', 'direct', 'splash', 'direct', 'slow', 'splash'], tiers: [] },
  { rotation: ['direct', 'direct', 'antishield', 'splash', 'slow', 'antishield', 'direct'], tiers: ['direct'] },
  {
    rotation: ['direct', 'direct', 'splash', 'antishield', 'chain', 'slow', 'direct', 'chain', 'antishield', 'splash'],
    tiers: ['direct'],
  },
  {
    rotation: ['direct', 'direct', 'splash', 'antishield', 'chain', 'slow', 'sniper', 'chain', 'antishield', 'direct'],
    tiers: ['direct', 'antishield', 'splash'],
  },
  {
    rotation: ['direct', 'direct', 'splash', 'antishield', 'chain', 'slow', 'sniper', 'support', 'chain', 'antishield', 'direct', 'splash'],
    tiers: ['direct', 'antishield', 'splash', 'chain', 'slow'],
  },
];

const center = (col: number, row: number) => ({ x: col * TILE + TILE / 2, y: PLAY_Y + row * TILE + TILE / 2 });

function coverage(world: World, col: number, row: number, range: number): number {
  const c = center(col, row);
  let n = 0;
  for (const [pc, pr] of world.grid.pathTiles) {
    const p = center(pc, pr);
    if ((p.x - c.x) ** 2 + (p.y - c.y) ** 2 <= range * range) n++;
  }
  return n;
}

function bestCell(world: World, id: TowerArchetype): [number, number] | null {
  const def = world.content.towers[id];
  const range = def.levels[0].range;
  let best: [number, number] | null = null;
  let bestScore = 0;
  for (let r = 0; r < world.grid.rows; r++) {
    for (let c = 0; c < world.grid.cols; c++) {
      if (!world.canBuild(c, r)) continue;
      let score = coverage(world, c, r, range);
      if (def.attack === 'support') {
        const p = center(c, r);
        const buffed = world.towers.filter((t) => t.def.attack !== 'support' && (t.x - p.x) ** 2 + (t.y - p.y) ** 2 <= range * range).length;
        score = buffed * 4 + score * 0.25;
      }
      if (score > bestScore) {
        bestScore = score;
        best = [c, r];
      }
    }
  }
  return best;
}

function spend(world: World, plan: BotPlan, state: { next: number }): void {
  for (let guard = 0; guard < 60; guard++) {
    const id = plan.rotation[state.next % plan.rotation.length];
    const buildCost = world.content.towers[id].levels[0].cost;
    const wantBuild = world.towers.length < 3 + Math.floor(world.run.waveIndex * 0.8);
    const upgrades = world.towers
      .map((t) => ({ t, s: world.upgradeStatus(t) }))
      .flatMap((o) => (o.s.kind === 'ok' ? [{ t: o.t, cost: o.s.cost }] : []))
      .sort((a, b) => a.cost - b.cost);
    const upg = upgrades[0];

    const tryBuild = () => {
      const cell = bestCell(world, id);
      if (!cell || !world.buildTower(id, cell[0], cell[1])) return false;
      state.next++;
      return true;
    };

    if (wantBuild) {
      if (world.run.canAfford(buildCost) && tryBuild()) continue;
      break; // save up for the next planned tower instead of frittering cash on upgrades
    }
    if (upg && world.run.canAfford(upg.cost) && world.upgradeTower(upg.t)) continue;
    if (world.run.canAfford(buildCost) && tryBuild()) continue;
    break;
  }
}

export function simulateMap(
  map: MapDef,
  plan: BotPlan,
  dt = 1 / 30,
  content: WorldContent = getSkin(DEFAULT_SKIN),
): SimResult {
  const maxLevel = (id: TowerArchetype) => (plan.tiers.includes(id) ? 3 : 2);
  let leakedThisWave: string[] = [];
  const world = new World(
    createStubScene(),
    map,
    content,
    createStubEffects(),
    { onLeak: (e) => leakedThisWave.push(e.def.id) },
    maxLevel,
  );
  const state = { next: 0 };
  const leaksByWave: number[] = [];
  const hpByWave: number[] = [];
  const leakedIds: string[][] = [];

  while (!world.ended) {
    spend(world, plan, state);
    leakedThisWave = [];
    if (!world.startWave()) break;
    let t = 0;
    while (world.run.phase === 'wave' && t < 900) {
      world.update(dt);
      t += dt;
    }
    leaksByWave.push(leakedThisWave.length);
    leakedIds.push(leakedThisWave);
    hpByWave.push(world.run.hp);
    if (t >= 900) break;
  }

  return {
    map: map.id,
    victory: world.run.phase === 'victory',
    hp: world.run.hp,
    wavesCleared: world.run.wavesCleared,
    totalWaves: world.run.totalWaves,
    leaksByWave,
    hpByWave,
    leakedIds,
    towers: world.towers.length,
    cashLeft: world.run.cash,
  };
}
