import type { PixelArt } from '../../../assets/pixel';
import { WW2_ART_PALETTE as P } from './palette';

/**
 * Command bunker: concrete casemate, firing slit and a signal flag. What you are defending.
 * Authored as a left half (12 cols) and mirrored to 24x24.
 */
export const WW2_BASE_ART: PixelArt = {
  palette: P,
  mirrorX: true,
  frames: [
    [
      '...........o',
      '...........o',
      '.......rrrro',
      '.......rrrro',
      '.......RRRRo',
      '...........o',
      '...........o',
      '...........o',
      '.....oooooo.',
      '....ollllll.',
      '...olmmmmmmm',
      '...olmdddddd',
      '..olmdllllll',
      '..olmdlwwwww',
      '..olmdlwyyyy',
      '..olmdlwwwww',
      '..olmdllllll',
      '.olmdddddddd',
      '.olmdmmmmmmm',
      '.olmdmdddddd',
      '.olmdmdPPPPP',
      '.olmdmdPtttt',
      'olmdmdPttttt',
      'oooooooooooo',
    ],
    [
      '...........o',
      '...........o',
      '......rrrrro',
      '.......rrrro',
      '.......RRRRo',
      '...........o',
      '...........o',
      '...........o',
      '.....oooooo.',
      '....ollllll.',
      '...olmmmmmmm',
      '...olmdddddd',
      '..olmdllllll',
      '..olmdlwwwww',
      '..olmdlwwwww',
      '..olmdlwwwww',
      '..olmdllllll',
      '.olmdddddddd',
      '.olmdmmmmmmm',
      '.olmdmdddddd',
      '.olmdmdPPPPP',
      '.olmdmdPtttt',
      'olmdmdPttttt',
      'oooooooooooo',
    ],
  ],
};

export const WW2_FX = {
  /** Howitzer shell. */
  projSplash: { palette: P, mirrorX: true, mirrorY: true, frames: [['..o', '.ob', 'oby']] } as PixelArt,
  /** AT rifle tracer. */
  projAntishield: {
    palette: P,
    mirrorX: true,
    mirrorY: true,
    frames: [
      ['..c', '.cB', 'cBw'],
      ['..B', '.Bw', 'Bwy'],
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
      ['........', '......pp', '....ppRR', '...pRRRR', '..pRRyyy', '..pRyyyy', '.pRRyy..', '.pRyy...'],
      ['........', '.....P..', '...P...p', '..P..p..', '.....p..', '..p.....', '.P......', '........'],
    ],
  } as PixelArt,
  /** Mud and wire drag, not frost. */
  frost: { palette: P, frames: [['.P.', 'PtP', '.P.']] } as PixelArt,
  heal: { palette: P, frames: [['.w.', 'wrw', '.w.']] } as PixelArt,
};

export const WW2_ICONS: Record<string, PixelArt> = {
  // Supply crate: this world's in-run currency.
  icon_credit: {
    palette: P,
    frames: [['..oooo..', '.oPPPPo.', 'oPttttPo', 'oPtwwtPo', 'oPtwwtPo', 'oPttttPo', '.oPPPPo.', '..oooo..']],
  },
  // Medal on a ribbon: the meta currency.
  icon_core: {
    palette: P,
    frames: [['.oooooo.', '.orwrwro', '.orrwrro', '..oyyyo.', '.oyyyyyo', 'oyyRRyyo', '.oyyyyyo', '..ooooo.']],
  },
};
