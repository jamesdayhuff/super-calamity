import type { PixelArt } from '../../../assets/pixel';
import { WEST_ART_PALETTE as P } from './palette';

/**
 * The town bank: stone front, barred window and a strongbox lamp. What you are defending.
 * Authored as a left half (12 cols) and mirrored to 24x24.
 */
export const WEST_BASE_ART: PixelArt = {
  palette: P,
  mirrorX: true,
  frames: [
    [
      '............',
      '...........o',
      '.........ooy',
      '........oyyy',
      '.......oyylw',
      '......ollllw',
      '.....olllllw',
      '....ollllmmm',
      '...ollllmmmm',
      '..olllmmmmmm',
      '.ooooooooooo',
      '.olllllllllm',
      '.olmmmmmmmmm',
      '.olmoooooooo',
      '.olmoddddddd',
      '.olmodyyyyyy',
      '.olmodyoyoyo',
      '.olmodyyyyyy',
      '.olmoddddddd',
      '.olmmmmmmmmm',
      '.olmdddddddd',
      '.olmdttttttt',
      '.olmdtdtdtdt',
      'oooooooooooo',
    ],
    [
      '............',
      '...........o',
      '.........ooy',
      '........oyyw',
      '.......oyylw',
      '......ollllw',
      '.....olllllw',
      '....ollllmmm',
      '...ollllmmmm',
      '..olllmmmmmm',
      '.ooooooooooo',
      '.olllllllllm',
      '.olmmmmmmmmm',
      '.olmoooooooo',
      '.olmoddddddd',
      '.olmodwwwwww',
      '.olmodwowowo',
      '.olmodwwwwww',
      '.olmoddddddd',
      '.olmmmmmmmmm',
      '.olmdddddddd',
      '.olmdttttttt',
      '.olmdtdtdtdt',
      'oooooooooooo',
    ],
  ],
};

export const WEST_FX = {
  /** A stick of dynamite, fuse lit. */
  projSplash: { palette: P, mirrorX: true, mirrorY: true, frames: [['..o', '.or', 'ory']] } as PixelArt,
  /** Buffalo gun slug. */
  projAntishield: {
    palette: P,
    mirrorX: true,
    mirrorY: true,
    frames: [
      ['..B', '.Bl', 'Blw'],
      ['..l', '.lB', 'lBw'],
    ],
  } as PixelArt,
  spark: { palette: P, frames: [['.y.', 'ywy', '.y.']] } as PixelArt,
  explosion: {
    palette: P,
    mirrorX: true,
    mirrorY: true,
    frames: [
      ['........', '........', '........', '........', '........', '......yy', '.....yww', '.....yww'],
      ['........', '........', '........', '......RR', '....RRyy', '...Ryyyw', '...Ryyww', '..Ryyyww'],
      ['........', '......rr', '....rrRR', '...rRRRR', '..rRRyyy', '..rRyyyy', '.rRRyy..', '.rRyy...'],
      ['........', '.....m..', '...m...l', '..m..l..', '.....l..', '..l.....', '.m......', '........'],
    ],
  } as PixelArt,
  /** Tar, not frost. */
  frost: { palette: P, frames: [['.p.', 'pPp', '.p.']] } as PixelArt,
  heal: { palette: P, frames: [['.G.', 'GwG', '.G.']] } as PixelArt,
};

export const WEST_ICONS: Record<string, PixelArt> = {
  // Silver dollar: this world's in-run currency.
  icon_credit: {
    palette: P,
    frames: [['..oooo..', '.oBBBBo.', 'oBBwwBBo', 'oBBwBBBo', 'oBBwBBBo', 'oBBwwBBo', '.oBBBBo.', '..oooo..']],
  },
  // Gold nugget: the meta currency.
  icon_core: {
    palette: P,
    frames: [['........', '..ooo...', '.oywyoo.', 'oyyywyo.', 'oyyyyyyo', '.oyyyyyo', '..ooyyo.', '....oo..']],
  },
};
