/**
 * The shared mechanical vocabulary. Every skin implements exactly these archetypes — the ids name
 * what a thing *does*, never what it looks like, so `skins/ww2/towers.ts` reads
 * `sniper: { name: '88mm AT Gun' }` rather than `railgun: { name: '88mm AT Gun' }`.
 */

export type TowerArchetype =
  | 'direct'
  | 'splash'
  | 'slow'
  | 'antishield'
  | 'sniper'
  | 'chain'
  | 'support';

export type EnemyArchetype =
  | 'scout'
  | 'grunt'
  | 'armored'
  | 'shielded'
  | 'splitter'
  | 'splitling'
  | 'healer'
  | 'stealth'
  | 'boss_1'
  | 'boss_2'
  | 'boss_3'
  | 'boss_4'
  | 'boss_5';

/** Display / hotkey order in the tower bar (1-7). */
export const TOWER_ORDER: TowerArchetype[] = [
  'direct',
  'splash',
  'slow',
  'antishield',
  'sniper',
  'chain',
  'support',
];

export const TOWER_ARCHETYPES: TowerArchetype[] = [...TOWER_ORDER];

export const ENEMY_ARCHETYPES: EnemyArchetype[] = [
  'scout',
  'grunt',
  'armored',
  'shielded',
  'splitter',
  'splitling',
  'healer',
  'stealth',
  'boss_1',
  'boss_2',
  'boss_3',
  'boss_4',
  'boss_5',
];

/** Bosses, in map order. One per map slot; map 5 also reuses earlier ones as mid-bosses. */
export const BOSS_ARCHETYPES: EnemyArchetype[] = ['boss_1', 'boss_2', 'boss_3', 'boss_4', 'boss_5'];

/** How many maps every skin ships. */
export const MAP_SLOTS = 5;
