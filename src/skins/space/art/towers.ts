import type { TowerArchetype } from '../../../balance/archetypes';
import type { PixelArt } from '../../../assets/pixel';
import type { HeadArt } from '../../types';
import { C, SPACE_ART_PALETTE } from './palette';

/** Accent ramps per archetype: [dim (L1), bright (L2), light (L3)]. */
export const SPACE_ACCENTS: Record<TowerArchetype, [string, string, string]> = {
  direct: [C.purple, C.red, C.orange],
  splash: [C.red, C.orange, C.yellow],
  slow: [C.teal, C.sky, C.cyan],
  sniper: [C.navy, C.light, C.white],
  antishield: [C.navy, C.blue, C.sky],
  chain: [C.purple, C.violet, C.lilac],
  support: [C.teal, C.green, C.lime],
};

/** Shared platform (quadrant, mirrored both ways). 'a' = accent lights, 'x' = trim (gold at L3). */
export const SPACE_PLATFORM = [
  '........',
  '........',
  '...ooooo',
  '..oxllll',
  '.oxlmmmm',
  '.olmdddd',
  '.olmdadd',
  '.olmdddd',
];

/** Heads. 'A' = accent, '3' = pixels only drawn at level 3. */
export const SPACE_HEADS: Record<TowerArchetype, HeadArt> = {
  direct: {
    mirrorX: false,
    rows: [
      '................',
      '................',
      '................',
      '....oooooo......',
      '...omllllmo.....',
      '..omlwwllmo33333',
      '..omlAAllmoooooo',
      '..omlAAllmmllllw',
    ],
  },
  sniper: {
    mirrorX: false,
    rows: [
      '................',
      '................',
      '................',
      '................',
      '.ooooo......3...',
      '.ommmmoooooooooo',
      '.omllmmmmmmmmmmo',
      '.omlAAAAAAAAAAA3',
    ],
  },
  splash: {
    mirrorX: true,
    rows: ['........', '........', '..3.....', '.....ooo', '....omll', '...omloo', '...omoAA', '...omoAw'],
  },
  slow: {
    mirrorX: true,
    rows: ['........', '........', '..3....o', '......oc', '.....ocB', '....ocBw', '...ocBAA', '..ocBAAw'],
  },
  antishield: {
    mirrorX: true,
    rows: ['........', '.3......', '....oooo', '...obbbb', '..obBBBB', '..obBccc', '..obBcAA', '..obBcAw'],
  },
  chain: {
    mirrorX: true,
    rows: ['........', '........', '..3.oooo', '...oPPPP', '..oPoooo', '..oPommm', '..oPomAA', '..oPomAw'],
  },
  support: {
    mirrorX: true,
    rows: ['........', '........', '..oooooo', '..ommmmm', '..omdddd', '..omdAdd', '..omdAd3', '..omdAAA'],
  },
};

/** Small orbiting drone used by the support tower. */
export const SPACE_ORBITER: PixelArt = {
  palette: SPACE_ART_PALETTE,
  frames: [
    ['o...o', '.oGo.', '.GyG.', '.oGo.', 'o...o'],
    ['.o.o.', 'ooGoo', '.GyG.', 'ooGoo', '.o.o.'],
  ],
};

/** The original art tinted the level-3 detail gold on these two heads. */
export const SPACE_L3_TRIM: Partial<Record<TowerArchetype, string>> = {
  splash: C.gold,
  support: C.gold,
};
