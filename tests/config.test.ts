import { describe, expect, it } from 'vitest';
import { SFX_EVENTS } from '../src/assets/audio/events';
import { TEX } from '../src/skins/keys';
import { SHARED_ICON_ROWS } from '../src/assets/sprites/icons';
import { buildTextures } from '../src/assets/manifest';
import { expandArt } from '../src/assets/pixel';
import { MAP_SLOTS } from '../src/balance/archetypes';
import { WAVE_CURVES } from '../src/balance/waves';
import { COLS, ROWS } from '../src/constants';
import { getSkin } from '../src/skins/registry';
import { SKIN_IDS } from '../src/skins/types';
import { buildGrid } from '../src/systems/Grid';

describe.each(SKIN_IDS)('skin: %s', (skinId) => {
  const s = getSkin(skinId);
  const textures = buildTextures(s);

  it(`ships ${MAP_SLOTS} maps wired to the shared wave curves`, () => {
    expect(s.maps).toHaveLength(MAP_SLOTS);
    expect(s.maps.map((m) => m.waves)).toEqual(WAVE_CURVES);
  });

  it('has unique map ids', () => {
    expect(new Set(s.maps.map((m) => m.id)).size).toBe(s.maps.length);
  });

  for (const map of s.maps) {
    describe(map.id, () => {
      it('has a valid, non-overlapping orthogonal path ending inside the grid', () => {
        const grid = buildGrid(map, COLS, ROWS);
        const keys = grid.pathTiles.map(([c, r]) => `${c},${r}`);
        expect(new Set(keys).size).toBe(keys.length);
        const [bc, br] = grid.base;
        expect(bc >= 0 && bc < COLS && br >= 0 && br < ROWS).toBe(true);
      });

      it('only references known enemies and ends with a boss', () => {
        for (const wave of map.waves) for (const gr of wave.groups) expect(s.enemies[gr.enemy], gr.enemy).toBeDefined();
        const last = map.waves[map.waves.length - 1];
        expect(last.groups.some((gr) => s.enemies[gr.enemy].boss)).toBe(true);
      });

      it('references an existing theme and track', () => {
        expect(s.themes[map.theme], map.theme).toBeDefined();
        expect(s.tracks[map.music], map.music).toBeDefined();
      });

      it('introduces only known enemies', () => {
        for (const id of map.introduces) expect(s.enemies[id], id).toBeDefined();
      });
    });
  }

  describe('assets', () => {
    it('every sprite key used by content exists in the manifest', () => {
      const keys: string[] = [];
      for (const t of Object.values(s.towers)) keys.push(...t.sprites.base, ...t.sprites.head, t.icon);
      for (const e of Object.values(s.enemies)) keys.push(e.sprite);
      for (const th of Object.values(s.themes)) keys.push(...th.floorTiles, th.pathTile, ...th.decor);
      for (const k of keys) expect(textures[k], k).toBeDefined();
    });

    /**
     * The keys above come from content data; these come from runtime code (Effects, Projectile,
     * Tower, GameScene), which nothing else checks. A rename in the manifest that misses a call
     * site shows up in-game as Phaser's green missing-texture box, so it is asserted here instead.
     */
    it('bakes every texture key the runtime references directly', () => {
      for (const key of Object.values(TEX)) expect(textures[key], key).toBeDefined();
      for (const key of Object.keys(SHARED_ICON_ROWS)) expect(textures[key], key).toBeDefined();
      for (const key of ['icon_credit', 'icon_core']) expect(textures[key], key).toBeDefined();
    });

    it('defines a recipe for every sfx event', () => {
      for (const e of SFX_EVENTS) expect(s.sfx[e], e).toBeDefined();
    });

    it('every tower fire sound is a known event', () => {
      for (const t of Object.values(s.towers)) expect(s.sfx[t.sfx.fire], t.sfx.fire).toBeDefined();
    });

    it('defines a menu track', () => {
      expect(s.tracks.menu).toBeDefined();
    });

    it('split abilities reference known enemies', () => {
      for (const e of Object.values(s.enemies)) {
        for (const a of e.abilities ?? []) if (a.type === 'split') expect(s.enemies[a.into], a.into).toBeDefined();
      }
    });

    it('pixel art uses only palette-defined characters and consistent frame sizes', () => {
      for (const [key, src] of Object.entries(textures)) {
        if (src.kind !== 'pixel') continue;
        const { frames } = expandArt(src.art);
        const dims = frames.map((f) => `${Math.max(...f.map((r) => r.length))}x${f.length}`);
        expect(new Set(dims).size, `${key} frame sizes ${dims}`).toBe(1);
        for (const f of frames) {
          for (const row of f) {
            expect(row.length, `${key} row "${row}"`).toBe(f[0].length);
            for (const ch of row) {
              if (ch === '.' || ch === ' ') continue;
              expect(src.art.palette[ch], `${key} uses undefined char '${ch}'`).toBeDefined();
            }
          }
        }
      }
    });

    it('fills every string field', () => {
      for (const [k, v] of Object.entries(s.strings)) expect(v, k).toBeTruthy();
    });
  });
});
