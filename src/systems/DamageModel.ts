import { DAMAGE_MULTIPLIERS } from '../balance/combat';
import type { DamageType } from '../balance/types';

export interface Damageable {
  hp: number;
  shield: number;
}

export interface DamageResult {
  shieldDamage: number;
  hullDamage: number;
  shieldBroken: boolean;
  killed: boolean;
}

/**
 * Apply raw damage of a type: shields absorb first (scaled by the type's shield multiplier);
 * any leftover raw damage carries through to hull (scaled by the hull multiplier). Mutates target.
 */
export function applyDamage(target: Damageable, amount: number, type: DamageType): DamageResult {
  const mult = DAMAGE_MULTIPLIERS[type];
  let raw = Math.max(0, amount);
  let shieldDamage = 0;
  let shieldBroken = false;

  if (target.shield > 0 && raw > 0 && mult.shield > 0) {
    const effective = raw * mult.shield;
    if (effective < target.shield) {
      target.shield -= effective;
      shieldDamage = effective;
      raw = 0;
    } else {
      shieldDamage = target.shield;
      raw -= target.shield / mult.shield;
      target.shield = 0;
      shieldBroken = true;
    }
  }

  const hullDamage = Math.min(target.hp, raw * mult.hull);
  target.hp -= hullDamage;
  return { shieldDamage, hullDamage, shieldBroken, killed: target.hp <= 0 };
}
