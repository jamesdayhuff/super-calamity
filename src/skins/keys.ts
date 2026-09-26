/** Texture keys that are not derived from a content id. Skin-agnostic names. */
export const TEX = {
  /** The defended object at the end of the path (space: reactor core, west: town bank). */
  base: 'base_object',
  projSplash: 'proj_splash',
  projAntishield: 'proj_antishield',
  spark: 'fx_spark',
  explosion: 'fx_explosion',
  frost: 'fx_frost',
  heal: 'fx_heal',
  orbiter: 'fx_orbiter',
} as const;

export const towerBaseKey = (id: string, lvl: 1 | 2 | 3) => `tower_${id}_base_${lvl}`;
export const towerHeadKey = (id: string, lvl: 1 | 2 | 3) => `tower_${id}_head_${lvl}`;
export const towerIconKey = (id: string) => `icon_tower_${id}`;
export const enemyKey = (id: string) => `enemy_${id}`;
export const tileKey = (theme: string, variant: string) => `tile_${theme}_${variant}`;
/** Skin-select card preview, baked for every skin rather than just the active one. */
export const previewKey = (skinId: string) => `preview_${skinId}`;
