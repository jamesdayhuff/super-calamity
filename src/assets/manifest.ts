/**
 * Asset manifest: every texture and sound the game uses is referenced by key.
 *
 * Keys are built from the active skin's content, so only one skin's textures are baked at a time
 * (plus a small preview sprite per skin for the skin-select screen).
 *
 * Swapping in real art/audio requires no game-code changes — add an entry to TEXTURE_FILES or
 * AUDIO_FILES with the same key. File entries are loaded first; procedural placeholders are
 * only generated for keys not already loaded.
 */
import { ENEMY_ARCHETYPES, TOWER_ARCHETYPES } from '../balance/archetypes';
import { enemyKey, previewKey, TEX, tileKey, towerBaseKey, towerHeadKey, towerIconKey } from '../skins/keys';
import { getSkin } from '../skins/registry';
import { SKIN_IDS, type ResolvedSkin, type SkinId } from '../skins/types';
import type { PixelArt } from './pixel';
import { SHARED_ICON_ROWS } from './sprites/icons';
import { TILE_VARIANTS, type TileVariant } from './tileTypes';
import { towerBaseArt, towerHeadArt } from './sprites/towerBuilder';

export type TextureSource =
  | { kind: 'pixel'; art: PixelArt }
  | { kind: 'tile'; skin: SkinId; theme: string; variant: TileVariant }
  | { kind: 'composite'; layers: string[]; size: number };

export interface TextureFile {
  url: string;
  /** Provide frame size for animated spritesheets. */
  frameWidth?: number;
  frameHeight?: number;
}

/** Drop-in art overrides: key -> file. Example: enemy_scout: { url: 'assets/scout.png', frameWidth: 12, frameHeight: 12 } */
export const TEXTURE_FILES: Record<string, TextureFile> = {};

/** Drop-in audio overrides: key -> file url. Keys are `sfx_<event>` and `music_<track>`. */
export const AUDIO_FILES: Record<string, string> = {};

/** Every texture key the given skin needs, with the recipe to bake it. */
export function buildTextures(s: ResolvedSkin): Record<string, TextureSource> {
  const t: Record<string, TextureSource> = {};
  const pixel = (key: string, art: PixelArt) => (t[key] = { kind: 'pixel', art });
  const { art } = s;

  for (const id of TOWER_ARCHETYPES) {
    for (const lvl of [1, 2, 3] as const) {
      pixel(towerBaseKey(id, lvl), towerBaseArt(art, id, lvl));
      pixel(towerHeadKey(id, lvl), towerHeadArt(art, id, lvl));
    }
    t[towerIconKey(id)] = { kind: 'composite', layers: [towerBaseKey(id, 1), towerHeadKey(id, 1)], size: 16 };
  }

  for (const id of ENEMY_ARCHETYPES) pixel(enemyKey(id), art.enemies[id]);

  pixel(TEX.base, art.base);
  pixel(TEX.projSplash, art.fx.projSplash);
  pixel(TEX.projAntishield, art.fx.projAntishield);
  pixel(TEX.spark, art.fx.spark);
  pixel(TEX.explosion, art.fx.explosion);
  pixel(TEX.frost, art.fx.frost);
  pixel(TEX.heal, art.fx.heal);
  pixel(TEX.orbiter, art.towers.orbiter);

  for (const [key, rows] of Object.entries(SHARED_ICON_ROWS)) pixel(key, { palette: art.palette, frames: [rows] });
  for (const [key, a] of Object.entries(art.icons)) pixel(key, a);
  for (const [key, a] of Object.entries(art.decor)) pixel(key, a);

  for (const theme of Object.keys(s.themes)) {
    for (const variant of TILE_VARIANTS) {
      t[tileKey(theme, variant)] = { kind: 'tile', skin: s.id, theme, variant };
    }
  }
  for (const [key, d] of Object.entries(art.tileDecor ?? {})) {
    t[key] = { kind: 'tile', skin: s.id, theme: d.theme, variant: d.variant };
  }

  return t;
}

/** One 16x16 card sprite per skin, baked for all skins so the skin-select screen can show them. */
export function buildPreviewTextures(): Record<string, TextureSource> {
  const t: Record<string, TextureSource> = {};
  for (const id of SKIN_IDS) t[previewKey(id)] = { kind: 'pixel', art: getSkin(id).art.base };
  return t;
}
