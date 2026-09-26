import { makePalette, type PaletteChar } from '../../../assets/sprites/palette';
import type { SkinPalette } from '../../types';

/** Sweetie-16: the original cold, high-contrast sci-fi ramp. */
export const C = {
  outline: '#1a1c2c',
  purple: '#5d275d',
  red: '#b13e53',
  orange: '#ef7d57',
  yellow: '#ffcd75',
  lime: '#a7f070',
  green: '#38b764',
  teal: '#257179',
  navy: '#29366f',
  blue: '#3b5dc9',
  sky: '#41a6f6',
  cyan: '#73eff7',
  white: '#f4f4f4',
  light: '#94b0c2',
  metal: '#566c86',
  dark: '#333c57',
  violet: '#c77dff',
  lilac: '#e0aaff',
  gold: '#ffcd75',
} as const;

const RAMP: Record<PaletteChar, string> = {
  o: C.outline,
  d: C.dark,
  m: C.metal,
  l: C.light,
  w: C.white,
  r: C.red,
  R: C.orange,
  y: C.yellow,
  g: C.green,
  G: C.lime,
  n: C.navy,
  b: C.blue,
  B: C.sky,
  c: C.cyan,
  p: C.purple,
  P: C.violet,
  t: C.teal,
};

export const SPACE_ART_PALETTE = makePalette(RAMP);

export const SPACE_UI_PALETTE: SkinPalette = {
  bg: 0x0b0d1a,
  panel: 0x1a1c2c,
  panelHi: 0x29366f,
  panelDeep: 0x333c57,
  disabled: 0x14151f,
  border: 0x566c86,
  borderHover: 0x94b0c2,
  borderHi: 0xffcd75,
  scrim: 0x05060f,
  text: '#f4f4f4',
  dim: '#94b0c2',
  faint: '#566c86',
  gold: '#ffcd75',
  red: '#ef7d57',
  green: '#a7f070',
  cyan: '#73eff7',
  violet: '#c77dff',
};
