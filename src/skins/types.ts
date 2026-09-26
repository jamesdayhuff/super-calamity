/**
 * The skin contract. A skin supplies *flavor only* — names, art, palette, copy, audio and map
 * layouts. Every mechanical number lives in src/balance and is shared, so one balance pass stays
 * valid across all three worlds.
 *
 * Nothing here may import Phaser at runtime (`import type` only) — skins are loaded by the
 * node-environment tests.
 */
import type * as Phaser from 'phaser';
import type { EnemyArchetype, TowerArchetype } from '../balance/archetypes';
import type { EnemyDef, MapDef, ThemeDef, TowerDef } from '../balance/types';
import type { SfxEvent } from '../assets/audio/events';
import type { SfxStep } from '../assets/audio/Synth';
import type { TrackDef } from '../assets/audio/tracks';
import type { PixelArt } from '../assets/pixel';
import type { TileVariant } from '../assets/tileTypes';

export type SkinId = 'space' | 'ww2' | 'west';

export const SKIN_IDS: SkinId[] = ['space', 'ww2', 'west'];

export type { SfxEvent };


/** All user-visible copy that changes between worlds. */
export interface SkinStrings {
  /** Shown under the game title, e.g. "STAR DEFENSE". */
  subtitle: string;
  /** One line on the title and skin-select screens. */
  tagline: string;
  /** Meta-currency, e.g. "CORES" / "MEDALS" / "GOLD". */
  metaCurrency: string;
  /** In-run currency, e.g. "CREDITS" / "SUPPLY" / "DOLLARS". */
  cashName: string;
  /** e.g. "SECTOR" / "OPERATION" / "TERRITORY". */
  levelNoun: string;
  levelNounPlural: string;
  /** Menu tab label, e.g. "SECTORS". */
  levelsTabLabel: string;
  /** Upgrade-shop label, e.g. "ARMORY" / "DEPOT" / "GUNSMITH". */
  armoryLabel: string;
  /** Start-the-run button, e.g. "LAUNCH" / "DEPLOY" / "RIDE OUT". */
  deployLabel: string;
  /** The thing you are defending, e.g. "CORE" / "BUNKER" / "BANK". */
  baseNoun: string;
  /** The regenerating damage pool, e.g. "SHIELD" / "ARMOR" / "COVER". */
  shieldNoun: string;
  /** Banner on a cleared map, e.g. "SECTOR SECURED". */
  winBanner: string;
  /** Banner on a lost map, e.g. "CORE DESTROYED". */
  loseBanner: string;
  /** Result-screen line for a leak, e.g. "CORE BREACHES". */
  leakLabel: string;
  /** Shown after the final map is cleared. */
  endingText: string;
}

/** UI chrome colors. Field names match the old COLORS table so widget signatures are unchanged. */
export interface SkinPalette {
  bg: number;
  panel: number;
  panelHi: number;
  /** One step above the panel fill: empty meter cells, bar backings, disabled tints. */
  panelDeep: number;
  disabled: number;
  border: number;
  borderHover: number;
  borderHi: number;
  /** Scrim drawn over the playfield for banners and the pause modal. */
  scrim: number;
  text: string;
  dim: string;
  faint: string;
  gold: string;
  red: string;
  green: string;
  cyan: string;
  violet: string;
}

/** The flavor half of a tower. Merged with TOWER_STATS to produce a TowerDef. */
export interface TowerSkin {
  name: string;
  blurb: string;
  /** Effect color for beams, rings and bolts. */
  color: number;
}

/** The flavor half of an enemy. Merged with ENEMY_STATS to produce an EnemyDef. */
export interface EnemySkin {
  name: string;
}

/** Pixel rows plus whether they are authored as a left half to be mirrored. */
export interface HeadArt {
  rows: string[];
  mirrorX: boolean;
}

export type TilePlot = (x: number, y: number, color: string) => void;

export interface SkinArt {
  /** char -> CSS color. Every skin uses the same char vocabulary so art rows stay portable. */
  palette: Record<string, string>;
  towers: {
    /** Quadrant of the shared platform, mirrored on both axes. */
    basePlatform: string[];
    heads: Record<TowerArchetype, HeadArt>;
    /** Per-archetype accent ramp: [dim (L1), bright (L2), light (L3)]. */
    accents: Record<TowerArchetype, [string, string, string]>;
    /** Trim color used on the level-3 platform. */
    trimL3: string;
    /** Overrides the color of level-3-only head pixels ('3') for specific archetypes. */
    l3Trim?: Partial<Record<TowerArchetype, string>>;
    /** The small orbiting helper drawn by support towers. */
    orbiter: PixelArt;
  };
  enemies: Record<EnemyArchetype, PixelArt>;
  decor: Record<string, PixelArt>;
  /** The defended object, animated. Drawn on the title screen and at the end of the path. */
  base: PixelArt;
  fx: {
    projSplash: PixelArt;
    projAntishield: PixelArt;
    spark: PixelArt;
    explosion: PixelArt;
    frost: PixelArt;
    heal: PixelArt;
  };
  /** Currency-flavored icons: `icon_credit` and `icon_core`. Generic icons are shared. */
  icons: Record<string, PixelArt>;
  /** Draw one 16x16 tile. Must be deterministic per (theme, variant). */
  drawTile(plot: TilePlot, theme: string, variant: TileVariant): void;
  /** Extra decor keys drawn as tiles rather than sprites, e.g. a 16x16 void field. */
  tileDecor?: Record<string, { theme: string; variant: TileVariant }>;
}

/** A skin as authored on disk. */
export interface SkinDef {
  id: SkinId;
  /** Shown on the skin-select card. */
  name: string;
  strings: SkinStrings;
  palette: SkinPalette;
  towers: Record<TowerArchetype, TowerSkin>;
  enemies: Record<EnemyArchetype, EnemySkin>;
  themes: Record<string, ThemeDef>;
  /** Exactly MAP_SLOTS maps; map N uses WAVE_CURVES[N]. */
  maps: MapDef[];
  art: SkinArt;
  sfx: Record<SfxEvent, SfxStep[]>;
  /** Must include a `menu` track plus one per map. */
  tracks: Record<string, TrackDef>;
  /** Paints the menu/title background. Space draws a starfield; the others draw their own. */
  backdrop(scene: Phaser.Scene, seed?: number): void;
}

/** A skin after its flavor has been merged with the shared mechanics. */
export interface ResolvedSkin extends Omit<SkinDef, 'towers' | 'enemies'> {
  towers: Record<TowerArchetype, TowerDef>;
  enemies: Record<EnemyArchetype, EnemyDef>;
}
