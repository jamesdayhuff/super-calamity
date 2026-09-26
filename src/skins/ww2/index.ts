import type { SkinDef } from '../types';
import { ww2Backdrop } from './art/backdrop';
import { WW2_DECOR } from './art/decor';
import { WW2_ENEMY_ART } from './art/enemies';
import { WW2_BASE_ART, WW2_FX, WW2_ICONS } from './art/fx';
import { WW2_ART_PALETTE, WW2_UI_PALETTE } from './art/palette';
import { drawWw2Tile } from './art/tiles';
import { WW2_ACCENTS, WW2_HEADS, WW2_L3_TRIM, WW2_ORBITER, WW2_PLATFORM } from './art/towers';
import { WW2_SFX } from './audio/sfx';
import { WW2_TRACKS } from './audio/tracks';
import { WW2_MAPS } from './maps';
import { WW2_STRINGS } from './strings';
import { WW2_THEMES } from './themes';

export const WW2_SKIN: SkinDef = {
  id: 'ww2',
  name: 'IRON FRONT',
  strings: WW2_STRINGS,
  palette: WW2_UI_PALETTE,

  towers: {
    direct: { name: 'MG Nest', blurb: 'Sustained fire from a dug-in gun.', color: 0xf0a830 },
    splash: { name: 'Howitzer', blurb: 'Indirect shells. Wide blast.', color: 0xb5451b },
    slow: { name: 'Minefield', blurb: 'Buried charges bog down a column.', color: 0x6b8f3f },
    antishield: { name: 'AT Rifle Team', blurb: 'Punches plate. Poor against men.', color: 0x9db4bf },
    sniper: { name: '88mm AT Gun', blurb: 'Reaches the far end of the map.', color: 0xe8e4d0 },
    chain: { name: 'Strafing Run', blurb: 'A pass that rakes the whole line.', color: 0xc2d4dc },
    support: { name: 'Radio Post', blurb: 'Coordinates fire. Spots hidden units.', color: 0x8fae4a },
  },

  enemies: {
    scout: { name: 'Motorcycle Scout' },
    grunt: { name: 'Infantry Squad' },
    armored: { name: 'Panzer IV' },
    shielded: { name: 'Tiger Tank' },
    splitter: { name: 'Troop Truck' },
    splitling: { name: 'Infantryman' },
    healer: { name: 'Field Medic' },
    stealth: { name: 'Camouflaged Sniper' },
    boss_1: { name: 'Ferdinand' },
    boss_2: { name: 'King Tiger' },
    boss_3: { name: 'Sturmtiger' },
    boss_4: { name: 'Maus' },
    boss_5: { name: 'Landkreuzer Ratte' },
  },

  themes: WW2_THEMES,
  maps: WW2_MAPS,

  art: {
    palette: WW2_ART_PALETTE,
    towers: {
      basePlatform: WW2_PLATFORM,
      heads: WW2_HEADS,
      accents: WW2_ACCENTS,
      trimL3: '#f0a830',
      l3Trim: WW2_L3_TRIM,
      orbiter: WW2_ORBITER,
    },
    enemies: WW2_ENEMY_ART,
    decor: WW2_DECOR,
    base: WW2_BASE_ART,
    fx: WW2_FX,
    icons: WW2_ICONS,
    drawTile: drawWw2Tile,
  },

  sfx: WW2_SFX,
  tracks: WW2_TRACKS,
  backdrop: ww2Backdrop,
};
