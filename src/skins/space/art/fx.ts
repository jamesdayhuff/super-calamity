import type { PixelArt } from '../../../assets/pixel';
import { SPACE_ART_PALETTE as P } from './palette';

/** The reactor core: what you are defending. */
export const SPACE_BASE_ART: PixelArt = {
  palette: P,
  mirrorX: true,
  mirrorY: true,
  frames: [
    [
      '............',
      '............',
      '......oooooo',
      '....oollllll',
      '...olmmmmmmm',
      '..olmddddddd',
      '..olmdbbbbbb',
      '.olmdbBBBBBB',
      '.olmdbBccccc',
      '.olmdbBccwww',
      '.olmdbBcwwww',
      '.olmdbBcwwww',
    ],
    [
      '............',
      '............',
      '......oooooo',
      '....oollllll',
      '...olmmmmmmm',
      '..olmddddddd',
      '..olmdbbbbbb',
      '.olmdbBBBBBB',
      '.olmdbBBBBBB',
      '.olmdbBBBccc',
      '.olmdbBBcccc',
      '.olmdbBBcccc',
    ],
  ],
};

export const SPACE_FX = {
  projSplash: {
    palette: P,
    mirrorX: true,
    mirrorY: true,
    frames: [['..o', '.oR', 'oRy']],
  } as PixelArt,
  projAntishield: {
    palette: P,
    mirrorX: true,
    mirrorY: true,
    frames: [
      ['..c', '.cB', 'cBw'],
      ['..B', '.Bc', 'Bcw'],
    ],
  } as PixelArt,
  spark: { palette: P, frames: [['.w.', 'wyw', '.w.']] } as PixelArt,
  explosion: {
    palette: P,
    mirrorX: true,
    mirrorY: true,
    frames: [
      ['........', '........', '........', '........', '........', '......yy', '.....yww', '.....yww'],
      ['........', '........', '........', '......RR', '....RRyy', '...Ryyyw', '...Ryyww', '..Ryyyww'],
      ['........', '......rr', '....rrRR', '...rRRRR', '..rRRyyy', '..rRyyyy', '.rRRyy..', '.rRyy...'],
      ['........', '.....d..', '...d...r', '..d..r..', '.....r..', '..r.....', '.d......', '........'],
    ],
  } as PixelArt,
  frost: { palette: P, frames: [['.c.', 'cwc', '.c.']] } as PixelArt,
  heal: { palette: P, frames: [['.G.', 'GGG', '.G.']] } as PixelArt,
};

/** Currency-flavored icons. `icon_credit` is in-run cash, `icon_core` is the meta currency. */
export const SPACE_ICONS: Record<string, PixelArt> = {
  icon_credit: {
    palette: P,
    frames: [['..oooo..', '.oyyyyo.', 'oyywwyyo', 'oyywyyyo', 'oyywyyyo', 'oyywwyyo', '.oyyyyo.', '..oooo..']],
  },
  icon_core: {
    palette: P,
    frames: [['...oo...', '..ocwo..', '.occwBo.', '.occBBo.', 'occBBBbo', '.oBBbbo.', '..obbo..', '...oo...']],
  },
};
