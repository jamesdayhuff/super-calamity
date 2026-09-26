import type { SkinDef } from '../types';
import { spaceBackdrop } from './art/backdrop';
import { SPACE_DECOR } from './art/decor';
import { SPACE_ENEMY_ART } from './art/enemies';
import { SPACE_BASE_ART, SPACE_FX, SPACE_ICONS } from './art/fx';
import { SPACE_ART_PALETTE, SPACE_UI_PALETTE } from './art/palette';
import { drawSpaceTile } from './art/tiles';
import { SPACE_ACCENTS, SPACE_HEADS, SPACE_L3_TRIM, SPACE_ORBITER, SPACE_PLATFORM } from './art/towers';
import { SPACE_SFX } from './audio/sfx';
import { SPACE_TRACKS } from './audio/tracks';
import { SPACE_MAPS } from './maps';
import { SPACE_STRINGS } from './strings';
import { SPACE_THEMES } from './themes';

export const SPACE_SKIN: SkinDef = {
  id: 'space',
  name: 'STAR DEFENSE',
  strings: SPACE_STRINGS,
  palette: SPACE_UI_PALETTE,

  towers: {
    direct: { name: 'Laser Turret', blurb: 'Steady single-target beam.', color: 0xff4d6d },
    splash: { name: 'Plasma Mortar', blurb: 'Lobbed plasma. Splash damage.', color: 0xff9f1c },
    slow: { name: 'Cryo Emitter', blurb: 'Freezing pulse slows all nearby.', color: 0x7fdbff },
    antishield: { name: 'EMP Tower', blurb: 'Shreds shields. Weak vs hull.', color: 0x4dd0ff },
    sniper: { name: 'Railgun', blurb: 'Huge range, huge damage, slow.', color: 0xe0e0ff },
    chain: { name: 'Arc Coil', blurb: 'Lightning chains between foes.', color: 0xc77dff },
    support: { name: 'Drone Bay', blurb: 'Buffs towers. Reveals cloaked.', color: 0x9ef01a },
  },

  enemies: {
    scout: { name: 'Scout Drone' },
    grunt: { name: 'Swarm Unit' },
    armored: { name: 'Armor Bot' },
    shielded: { name: 'Shielded Sentinel' },
    splitter: { name: 'Splitter Bot' },
    splitling: { name: 'Splitter Half' },
    healer: { name: 'Repair Drone' },
    stealth: { name: 'Cloaked Infiltrator' },
    boss_1: { name: 'Warden Mk.I' },
    boss_2: { name: 'Mining Foreman' },
    boss_3: { name: 'Hive Hulk' },
    boss_4: { name: 'Overseer' },
    boss_5: { name: 'Dreadnought' },
  },

  themes: SPACE_THEMES,
  maps: SPACE_MAPS,

  art: {
    palette: SPACE_ART_PALETTE,
    towers: {
      basePlatform: SPACE_PLATFORM,
      heads: SPACE_HEADS,
      accents: SPACE_ACCENTS,
      trimL3: '#ffcd75',
      l3Trim: SPACE_L3_TRIM,
      orbiter: SPACE_ORBITER,
    },
    enemies: SPACE_ENEMY_ART,
    decor: SPACE_DECOR,
    base: SPACE_BASE_ART,
    fx: SPACE_FX,
    icons: SPACE_ICONS,
    drawTile: drawSpaceTile,
    tileDecor: { decor_void: { theme: 'orbital', variant: 'void' } },
  },

  sfx: SPACE_SFX,
  tracks: SPACE_TRACKS,
  backdrop: spaceBackdrop,
};
