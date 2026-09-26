import { ENEMY_ARCHETYPES, TOWER_ARCHETYPES } from '../balance/archetypes';
import { ENEMY_STATS } from '../balance/enemies';
import { TOWER_STATS } from '../balance/towers';
import type { EnemyDef, TowerDef } from '../balance/types';
import { enemyKey, towerBaseKey, towerHeadKey, towerIconKey } from './keys';
import { SPACE_SKIN } from './space';
import type { ResolvedSkin, SkinDef, SkinId } from './types';
import { WEST_SKIN } from './west';
import { WW2_SKIN } from './ww2';

/**
 * Merge a skin's flavor with the shared mechanics. The result has exactly the TowerDef / EnemyDef
 * shape the game layer has always consumed, so nothing downstream of here knows skins exist.
 */
export function resolveSkin(def: SkinDef): ResolvedSkin {
  const towers = {} as Record<string, TowerDef>;
  for (const id of TOWER_ARCHETYPES) {
    towers[id] = {
      id,
      ...TOWER_STATS[id],
      ...def.towers[id],
      sprites: {
        base: [towerBaseKey(id, 1), towerBaseKey(id, 2), towerBaseKey(id, 3)],
        head: [towerHeadKey(id, 1), towerHeadKey(id, 2), towerHeadKey(id, 3)],
      },
      icon: towerIconKey(id),
      sfx: { fire: `fire_${id}` as const },
    };
  }

  const enemies = {} as Record<string, EnemyDef>;
  for (const id of ENEMY_ARCHETYPES) {
    enemies[id] = { id, ...ENEMY_STATS[id], ...def.enemies[id], sprite: enemyKey(id) };
  }

  return { ...def, towers, enemies } as ResolvedSkin;
}

export const SKIN_DEFS: Record<SkinId, SkinDef> = {
  space: SPACE_SKIN,
  ww2: WW2_SKIN,
  west: WEST_SKIN,
};

const resolved = new Map<SkinId, ResolvedSkin>();

export function getSkin(id: SkinId): ResolvedSkin {
  let s = resolved.get(id);
  if (!s) {
    s = resolveSkin(SKIN_DEFS[id]);
    resolved.set(id, s);
  }
  return s;
}

export const DEFAULT_SKIN: SkinId = 'space';

let activeId: SkinId = DEFAULT_SKIN;

/** The active skin's content. Scenes take `const s = skin()` once at the top of create(). */
export function skin(): ResolvedSkin {
  return getSkin(activeId);
}

export function activeSkinId(): SkinId {
  return activeId;
}

/** Returns true if the skin actually changed (callers re-bake textures on true). */
export function setActiveSkin(id: SkinId): boolean {
  if (activeId === id) return false;
  activeId = id;
  return true;
}
