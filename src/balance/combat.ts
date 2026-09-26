import type { DamageType } from './types';

/**
 * Damage multipliers per damage type against shields and hull (HP).
 * Shields punish sustained single-target kinetic fire; EMP shreds shields but barely scratches hull.
 */
export const DAMAGE_MULTIPLIERS: Record<DamageType, { shield: number; hull: number }> = {
  kinetic: { shield: 0.6, hull: 1 },
  explosive: { shield: 0.75, hull: 1 },
  cryo: { shield: 1, hull: 1 },
  electric: { shield: 1.25, hull: 1 },
  emp: { shield: 3, hull: 0.4 },
};

export const COMBAT = {
  /** Multiplier applied to the chosen slow when an enemy is a boss (in addition to slowResist). */
  minSpeedFactor: 0.25,
  /** Seconds a cloaked enemy stays revealed after leaving a sensor field. */
  revealLinger: 0.25,
  /** Distance (px) the halves of a splitter are spread along the path. */
  splitSpread: 6,
};
