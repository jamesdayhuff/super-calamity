import { describe, expect, it } from 'vitest';
import { BOSS_ARCHETYPES, ENEMY_ARCHETYPES, MAP_SLOTS, TOWER_ARCHETYPES } from '../src/balance/archetypes';
import { getSkin } from '../src/skins/registry';
import { SKIN_IDS } from '../src/skins/types';

/**
 * Structural parity: every world must implement the same mechanical contract, so a run plays
 * identically in all three and one balance pass stays valid.
 */
describe('skin parity', () => {
  const skins = SKIN_IDS.map(getSkin);

  it('all skins implement every archetype', () => {
    for (const s of skins) {
      expect(Object.keys(s.towers).sort(), s.id).toEqual([...TOWER_ARCHETYPES].sort());
      expect(Object.keys(s.enemies).sort(), s.id).toEqual([...ENEMY_ARCHETYPES].sort());
    }
  });

  it('all skins ship the same number of maps and boss slots', () => {
    for (const s of skins) {
      expect(s.maps, s.id).toHaveLength(MAP_SLOTS);
      expect(BOSS_ARCHETYPES.filter((b) => s.enemies[b].boss), s.id).toHaveLength(BOSS_ARCHETYPES.length);
    }
  });

  it('skins share mechanics but not names', () => {
    for (const a of TOWER_ARCHETYPES) {
      const levels = skins.map((s) => JSON.stringify(s.towers[a].levels));
      expect(new Set(levels).size, `${a} levels diverge between skins`).toBe(1);
    }
    for (const e of ENEMY_ARCHETYPES) {
      const hp = skins.map((s) => s.enemies[e].hp);
      expect(new Set(hp).size, `${e} hp diverges between skins`).toBe(1);
    }
  });

  it('every skin names every tower and enemy', () => {
    for (const s of skins) {
      for (const a of TOWER_ARCHETYPES) expect(s.towers[a].name, `${s.id}.${a}`).toBeTruthy();
      for (const e of ENEMY_ARCHETYPES) expect(s.enemies[e].name, `${s.id}.${e}`).toBeTruthy();
    }
  });
});
