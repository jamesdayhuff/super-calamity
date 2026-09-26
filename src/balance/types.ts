// Shared type definitions for all data files.
// Nothing in src/balance or src/skins may import Phaser — it is pure, serializable data.

import type { SfxEvent } from '../assets/audio/events';
import type { EnemyArchetype, TowerArchetype } from './archetypes';

export type DamageType = 'kinetic' | 'explosive' | 'cryo' | 'electric' | 'emp';
export type TargetMode = 'first' | 'last' | 'strong';
export type TowerAttack = 'beam' | 'mortar' | 'pulse' | 'rail' | 'orb' | 'chain' | 'support';

export interface TowerLevel {
  /** Level 1: build cost. Level 2+: upgrade cost from the previous level. */
  cost: number;
  damage: number;
  /** Range in pixels (1 tile = 16px). */
  range: number;
  /** Attacks per second. 0 for pure support towers. */
  fireRate: number;
  splashRadius?: number;
  /** factor = fraction of speed removed (0.3 => 30% slower). */
  slow?: { factor: number; duration: number };
  chain?: { targets: number; falloff: number; jumpRange: number };
  pierce?: boolean;
  /** Support aura applied to other towers in range (multiplicative bonus, non-stacking). */
  buff?: { fireRate: number; damage: number };
  /** Reveals cloaked enemies within range. */
  sensor?: boolean;
  projectileSpeed?: number;
}

/** The mechanical half of a tower — authored once in src/balance, shared by every skin. */
export interface TowerStats {
  attack: TowerAttack;
  damageType: DamageType;
  levels: [TowerLevel, TowerLevel, TowerLevel];
}

/** A fully resolved tower: shared mechanics merged with the active skin's flavor. */
export interface TowerDef extends TowerStats {
  id: TowerArchetype;
  name: string;
  blurb: string;
  /** Sprite keys, one per level. Resolved through the asset manifest. */
  sprites: { base: [string, string, string]; head: [string, string, string] };
  icon: string;
  sfx: { fire: SfxEvent };
  /** Effect color (beams, rings, bolts). */
  color: number;
}

export type AbilityDef =
  | { type: 'split'; into: EnemyArchetype; count: number }
  | { type: 'heal'; radius: number; amount: number; interval: number }
  | { type: 'cloak'; visible: number; cloaked: number };

export interface ShieldDef {
  max: number;
  /** Seconds without shield damage before regen starts. */
  regenDelay: number;
  /** Shield points per second. */
  regenRate: number;
}

/** The mechanical half of an enemy — authored once in src/balance, shared by every skin. */
export interface EnemyStats {
  hp: number;
  /** Pixels per second. */
  speed: number;
  bounty: number;
  /** Base HP lost when this enemy reaches the base. */
  baseDamage: number;
  shield?: ShieldDef;
  abilities?: AbilityDef[];
  /** 0..1 — fraction of incoming slow ignored. */
  slowResist?: number;
  /** Hit radius in pixels. */
  radius: number;
  boss?: boolean;
  /** Enemies spawned by other enemies (e.g. splitter halves) are hidden from the bestiary. */
  spawnOnly?: boolean;
}

/** A fully resolved enemy: shared mechanics merged with the active skin's flavor. */
export interface EnemyDef extends EnemyStats {
  id: EnemyArchetype;
  name: string;
  sprite: string;
}

export interface SpawnGroup {
  enemy: EnemyArchetype;
  count: number;
  /** Seconds between spawns within the group. */
  interval: number;
  /** Seconds after wave start before the first spawn of this group. */
  delay: number;
}

export interface WaveDef {
  groups: SpawnGroup[];
  /** HP multiplier applied to every enemy in the wave. */
  hpMult: number;
}

export interface ThemeDef {
  id: string;
  /** Floor tile sprite keys; picked per cell by weight. */
  floorTiles: string[];
  floorWeights: number[];
  pathTile: string;
  /** Decorative (non-buildable) prop sprite keys. */
  decor: string[];
  /** 1px border color drawn where the path meets floor. */
  pathEdge: string;
  /** Page/scene background color. */
  background: string;
  /** Map-select card accent color. */
  accent: number;
}

export interface MapDef {
  id: string;
  name: string;
  subtitle: string;
  /** Key into the owning skin's `themes` record. */
  theme: string;
  /** Tile coordinates. First point may lie off-grid (spawn); last is the base. Segments must be orthogonal. */
  waypoints: Array<[number, number]>;
  startingCash: number;
  /** Key into the owning skin's `tracks` record. */
  music: string;
  waves: WaveDef[];
  /** Meta-currency earned per wave cleared. */
  metaPerWave: number;
  /** Meta-currency bonus for the first victory on this map. */
  firstClearBonus: number;
  /** Seed for deterministic decor scattering. */
  seed: number;
  /** Enemy archetypes introduced on this map (shown on the map card). */
  introduces: EnemyArchetype[];
}
