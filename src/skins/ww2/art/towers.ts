import type { TowerArchetype } from '../../../balance/archetypes';
import type { PixelArt } from '../../../assets/pixel';
import type { HeadArt } from '../../types';
import { C, WW2_ART_PALETTE } from './palette';

/** Accent ramps per archetype: [dim (L1), bright (L2), light (L3)]. */
export const WW2_ACCENTS: Record<TowerArchetype, [string, string, string]> = {
  direct: [C.darkOlive, C.rust, C.flash],
  splash: [C.blood, C.rust, C.flash],
  slow: [C.earth, C.mud, C.grass],
  sniper: [C.gunmetal, C.steel, C.coldSky],
  antishield: [C.steelDark, C.steel, C.bone],
  chain: [C.mudDark, C.coldSky, C.bone],
  support: [C.fieldGreen, C.grass, C.flash],
};

/** Sandbagged emplacement (quadrant, mirrored both ways). 'a' = accent, 'x' = trim. */
export const WW2_PLATFORM = [
  '........',
  '........',
  '...ooooo',
  '..oxPPPP',
  '.oxPttPP',
  '.oPtmmmm',
  '.oPtmadd',
  '.oPtmdmd',
];

export const WW2_HEADS: Record<TowerArchetype, HeadArt> = {
  // MG nest: water-cooled barrel over a sandbag lip.
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
      '..omlAAlmmbbbbbo',
    ],
  },
  // 88mm: long barrel with a muzzle brake.
  sniper: {
    mirrorX: false,
    rows: [
      '................',
      '................',
      '................',
      '................',
      '.ooooo.......3..',
      '.obbbboooooooooo',
      '.obmmbbbbbbbbbbo',
      '.obmAAAAAAAAAoAo',
    ],
  },
  // Howitzer: stubby barrel angled high on a split trail.
  splash: {
    mirrorX: true,
    rows: ['........', '........', '..3.....', '....oooo', '...ombbo', '..ombooo', '..omboAA', '..omboAw'],
  },
  // Minefield: a cluster of pressure mines behind wire.
  slow: {
    mirrorX: true,
    rows: ['........', '........', '..3..o..', '.....oto', '....otPo', '...oPPmo', '..oPmAAo', '..oPmAAw'],
  },
  // AT rifle team: long rifle on a bipod.
  antishield: {
    mirrorX: true,
    rows: ['........', '.3......', '....oooo', '...obbbb', '..obBBBB', '..obBmmm', '..obBmAA', '..obBmAw'],
  },
  // Strafing run: a ground marker panel and spotter scope.
  chain: {
    mirrorX: true,
    rows: ['........', '........', '..3.oooo', '...occcc', '..ocoooo', '..ocommm', '..ocomAA', '..ocomAw'],
  },
  // Radio post: mast and field set.
  support: {
    mirrorX: true,
    rows: ['..o.....', '..o.....', '..oooooo', '..ommmmm', '..omdddd', '..omdAdd', '..omdAd3', '..omdAAA'],
  },
};

/** The spotter plane that circles a Radio Post. */
export const WW2_ORBITER: PixelArt = {
  palette: WW2_ART_PALETTE,
  frames: [
    ['..o..', '.ooo.', 'GGwGG', '.ooo.', '..o..'],
    ['..o..', '.oGo.', 'GowoG', '.oGo.', '..o..'],
  ],
};

export const WW2_L3_TRIM: Partial<Record<TowerArchetype, string>> = {
  splash: C.flash,
  support: C.flash,
};
