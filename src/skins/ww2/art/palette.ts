import { makePalette, type PaletteChar } from '../../../assets/sprites/palette';
import type { SkinPalette } from '../../types';

/** Olive drab, field grey and rust, lit by muzzle flash. Warm where Space is cold. */
export const C = {
  outline: '#14140f',
  darkOlive: '#2b2e22',
  olive: '#4a4f3a',
  fieldGrey: '#7d8264',
  bone: '#e8e4d0',
  blood: '#6b2b1e',
  rust: '#b5451b',
  flash: '#f0a830',
  fieldGreen: '#2f4429',
  grass: '#6b8f3f',
  gunmetal: '#1c2630',
  steelDark: '#33454f',
  steel: '#5a7385',
  coldSky: '#9db4bf',
  mudDark: '#3a2f2a',
  mud: '#6e5a48',
  earth: '#4a3b2a',
} as const;

const RAMP: Record<PaletteChar, string> = {
  o: C.outline,
  d: C.darkOlive,
  m: C.olive,
  l: C.fieldGrey,
  w: C.bone,
  r: C.blood,
  R: C.rust,
  y: C.flash,
  g: C.fieldGreen,
  G: C.grass,
  n: C.gunmetal,
  b: C.steelDark,
  B: C.steel,
  c: C.coldSky,
  p: C.mudDark,
  P: C.mud,
  t: C.earth,
};

export const WW2_ART_PALETTE = makePalette(RAMP);

export const WW2_UI_PALETTE: SkinPalette = {
  bg: 0x14170f,
  panel: 0x24281c,
  panelHi: 0x3d4430,
  panelDeep: 0x2f3424,
  disabled: 0x101208,
  border: 0x5f6647,
  borderHover: 0x8a9168,
  borderHi: 0xf0a830,
  scrim: 0x0a0c06,
  text: '#e8e4d0',
  dim: '#9da081',
  faint: '#5f6647',
  gold: '#f0a830',
  red: '#c2502a',
  green: '#8fae4a',
  cyan: '#9db4bf',
  violet: '#8a7a9a',
};
