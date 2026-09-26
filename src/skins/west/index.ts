import type { SkinDef } from '../types';
import { westBackdrop } from './art/backdrop';
import { WEST_DECOR } from './art/decor';
import { WEST_ENEMY_ART } from './art/enemies';
import { WEST_BASE_ART, WEST_FX, WEST_ICONS } from './art/fx';
import { WEST_ART_PALETTE, WEST_UI_PALETTE } from './art/palette';
import { drawWestTile } from './art/tiles';
import { WEST_ACCENTS, WEST_HEADS, WEST_L3_TRIM, WEST_ORBITER, WEST_PLATFORM } from './art/towers';
import { WEST_SFX } from './audio/sfx';
import { WEST_TRACKS } from './audio/tracks';
import { WEST_MAPS } from './maps';
import { WEST_STRINGS } from './strings';
import { WEST_THEMES } from './themes';

export const WEST_SKIN: SkinDef = {
  id: 'west',
  name: 'DUST & LEAD',
  strings: WEST_STRINGS,
  palette: WEST_UI_PALETTE,

  towers: {
    direct: { name: 'Rifle Tower', blurb: 'A steady hand and a long sight.', color: 0xf0c040 },
    splash: { name: 'Dynamite Launcher', blurb: 'Lobbed sticks. Clears a crowd.', color: 0xc85a2e },
    slow: { name: 'Tar Pit', blurb: 'Everything through it walks slow.', color: 0x8a5a6a },
    antishield: { name: 'Buffalo Gun', blurb: 'Punches plate. Slow to reload.', color: 0xb89268 },
    sniper: { name: 'Sharpshooter Perch', blurb: 'Reaches clear across the map.', color: 0xf2e3c4 },
    chain: { name: 'Ricochet Revolver', blurb: 'Lead that bounces between targets.', color: 0x7d8f9c },
    support: { name: 'Lookout Tower', blurb: 'Calls the shot. Spots the hidden.', color: 0x7fa05a },
  },

  enemies: {
    scout: { name: 'Horse Rider' },
    grunt: { name: 'Bandit Gang' },
    armored: { name: 'Armored Stagecoach' },
    shielded: { name: 'Iron-Plated Wagon' },
    splitter: { name: 'Chuckwagon' },
    splitling: { name: 'Bandit' },
    healer: { name: 'Medicine Wagon' },
    stealth: { name: 'Ambusher' },
    boss_1: { name: 'The Marshal Killer' },
    boss_2: { name: 'Iron Horse' },
    boss_3: { name: 'Gatling Wagon' },
    boss_4: { name: 'The Outlaw King' },
    boss_5: { name: 'The Calamity' },
  },

  themes: WEST_THEMES,
  maps: WEST_MAPS,

  art: {
    palette: WEST_ART_PALETTE,
    towers: {
      basePlatform: WEST_PLATFORM,
      heads: WEST_HEADS,
      accents: WEST_ACCENTS,
      trimL3: '#f0c040',
      l3Trim: WEST_L3_TRIM,
      orbiter: WEST_ORBITER,
    },
    enemies: WEST_ENEMY_ART,
    decor: WEST_DECOR,
    base: WEST_BASE_ART,
    fx: WEST_FX,
    icons: WEST_ICONS,
    drawTile: drawWestTile,
  },

  sfx: WEST_SFX,
  tracks: WEST_TRACKS,
  backdrop: westBackdrop,
};
