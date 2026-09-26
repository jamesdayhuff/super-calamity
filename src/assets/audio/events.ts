/**
 * Every sound the game can make, named by what happened rather than by what it sounds like.
 * A skin must supply a recipe for all of them, so a half-authored skin is a compile error.
 */
export type SfxEvent =
  // UI
  | 'click'
  | 'error'
  | 'unlock'
  // Building
  | 'place'
  | 'upgrade'
  | 'sell'
  // Tower attacks — one per archetype, plus the shared splash detonation
  | 'fire_direct'
  | 'fire_splash'
  | 'fire_slow'
  | 'fire_antishield'
  | 'fire_sniper'
  | 'fire_chain'
  | 'fire_support'
  | 'boom'
  // Enemies
  | 'hit'
  | 'shield_hit'
  | 'shield_break'
  | 'death'
  | 'boss_death'
  | 'split'
  | 'heal'
  | 'cloak'
  // Flow
  | 'wave_start'
  | 'wave_clear'
  | 'base_hit'
  | 'victory'
  | 'defeat';

export const SFX_EVENTS: SfxEvent[] = [
  'click', 'error', 'unlock',
  'place', 'upgrade', 'sell',
  'fire_direct', 'fire_splash', 'fire_slow', 'fire_antishield', 'fire_sniper', 'fire_chain', 'fire_support', 'boom',
  'hit', 'shield_hit', 'shield_break', 'death', 'boss_death', 'split', 'heal', 'cloak',
  'wave_start', 'wave_clear', 'base_hit', 'victory', 'defeat',
];
