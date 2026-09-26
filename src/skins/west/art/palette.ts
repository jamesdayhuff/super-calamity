import { makePalette, type PaletteChar } from '../../../assets/sprites/palette';
import type { SkinPalette } from '../../types';

/** Sun-bleached sepia, leather and rust, with cactus green and a hard blue sky. */
export const C = {
  outline: '#241812',
  darkWood: '#47301f',
  leather: '#7a5230',
  sand: '#b89268',
  bone: '#f2e3c4',
  blood: '#8a2f22',
  rust: '#c85a2e',
  gold: '#f0c040',
  scrub: '#3d5233',
  cactus: '#7fa05a',
  nightBlue: '#2a3038',
  slate: '#4a5560',
  gunmetal: '#7d8f9c',
  skyPale: '#bcd0d8',
  duskDark: '#4a2a3a',
  dusk: '#8a5a6a',
  earth: '#5c4326',
} as const;

const RAMP: Record<PaletteChar, string> = {
  o: C.outline,
  d: C.darkWood,
  m: C.leather,
  l: C.sand,
  w: C.bone,
  r: C.blood,
  R: C.rust,
  y: C.gold,
  g: C.scrub,
  G: C.cactus,
  n: C.nightBlue,
  b: C.slate,
  B: C.gunmetal,
  c: C.skyPale,
  p: C.duskDark,
  P: C.dusk,
  t: C.earth,
};

export const WEST_ART_PALETTE = makePalette(RAMP);

export const WEST_UI_PALETTE: SkinPalette = {
  bg: 0x1a1109,
  panel: 0x2e1f14,
  panelHi: 0x4d3320,
  panelDeep: 0x3d2a1a,
  disabled: 0x140d07,
  border: 0x7a5230,
  borderHover: 0xb89268,
  borderHi: 0xf0c040,
  scrim: 0x140d07,
  text: '#f2e3c4',
  dim: '#b89268',
  faint: '#7a5230',
  gold: '#f0c040',
  red: '#c85a2e',
  green: '#7fa05a',
  cyan: '#bcd0d8',
  violet: '#8a5a6a',
};
