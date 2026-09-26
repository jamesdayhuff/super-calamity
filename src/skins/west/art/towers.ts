import type { TowerArchetype } from '../../../balance/archetypes';
import type { PixelArt } from '../../../assets/pixel';
import type { HeadArt } from '../../types';
import { C, WEST_ART_PALETTE } from './palette';

/** Accent ramps per archetype: [dim (L1), bright (L2), light (L3)]. */
export const WEST_ACCENTS: Record<TowerArchetype, [string, string, string]> = {
  direct: [C.darkWood, C.rust, C.gold],
  splash: [C.blood, C.rust, C.gold],
  slow: [C.outline, C.duskDark, C.dusk],
  sniper: [C.nightBlue, C.gunmetal, C.bone],
  antishield: [C.earth, C.leather, C.bone],
  chain: [C.slate, C.gunmetal, C.gold],
  support: [C.scrub, C.cactus, C.bone],
};

/** Timber decking on a stone footing (quadrant, mirrored both ways). */
export const WEST_PLATFORM = [
  '........',
  '........',
  '...ooooo',
  '..oxllll',
  '.oxlmmmm',
  '.olmdtdt',
  '.olmdadt',
  '.olmdtdt',
];

export const WEST_HEADS: Record<TowerArchetype, HeadArt> = {
  // Rifle tower: a shooter behind a plank parapet.
  direct: {
    mirrorX: false,
    rows: [
      '................',
      '................',
      '................',
      '...ooooo........',
      '..omlllmo.......',
      '..omwllmo3333333',
      '..omlAAlmooooooo',
      '..omlAAlmmdddddo',
    ],
  },
  // Sharpshooter perch: very long barrel across a sandbag rest.
  sniper: {
    mirrorX: false,
    rows: [
      '................',
      '................',
      '................',
      '................',
      '.ooooo.......3..',
      '.obbbboooooooooo',
      '.obBBbdddddddddo',
      '.obBAAAAAAAAAoAo',
    ],
  },
  // Dynamite launcher: a short mortar tube packed with sticks.
  splash: {
    mirrorX: true,
    rows: ['........', '........', '..3.....', '.....ooo', '....omdd', '...omdoo', '...omoAA', '...omoAw'],
  },
  // Tar pit: a bubbling black pool behind a low kerb.
  slow: {
    mirrorX: true,
    rows: ['........', '........', '..3..o..', '....oPpo', '...opPpo', '..opppmo', '..opmAAo', '..opmAAw'],
  },
  // Buffalo gun: heavy big-bore rifle on a forked rest.
  antishield: {
    mirrorX: true,
    rows: ['........', '.3......', '....oooo', '...odddd', '..odmmmm', '..odmlll', '..odmlAA', '..odmlAw'],
  },
  // Ricochet revolver: a mounted cylinder that bounces lead.
  chain: {
    mirrorX: true,
    rows: ['........', '........', '..3.oooo', '...oBBBB', '..oBoooo', '..oBobbb', '..oBobAA', '..oBobAw'],
  },
  // Lookout tower: a bell and a spyglass on a mast.
  support: {
    mirrorX: true,
    rows: ['..o.....', '..o.....', '..oooooo', '..ommmmm', '..omdddd', '..omdAdd', '..omdAd3', '..omdAAA'],
  },
};

/** The circling buzzard that a Lookout Tower keeps overhead. */
export const WEST_ORBITER: PixelArt = {
  palette: WEST_ART_PALETTE,
  frames: [
    ['o...o', '.ooo.', '.dwd.', '.ooo.', 'o...o'],
    ['.....', 'ooooo', '.dwd.', 'ooooo', '.....'],
  ],
};

export const WEST_L3_TRIM: Partial<Record<TowerArchetype, string>> = {
  splash: C.gold,
  support: C.gold,
};
