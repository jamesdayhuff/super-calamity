/**
 * The shared char vocabulary for pixel art. Every skin maps these same 17 chars to its own colors,
 * which is what lets art rows stay portable between worlds — swapping a skin's ramp reskins every
 * sprite at once.
 *
 *   o  outline (darkest)        d  dark shade        m  mid tone        l  light tone
 *   w  brightest highlight
 *   r  warm dark    R  warm mid     y  warm light        (reds/oranges/yellows)
 *   g  green dark   G  green light
 *   n  cool darkest  b  cool dark   B  cool mid   c  cool light   (navies/blues/cyans)
 *   p  alt dark     P  alt mid      t  alt deep          (purples/teals)
 */
export type PaletteChar =
  | 'o' | 'd' | 'm' | 'l' | 'w'
  | 'r' | 'R' | 'y'
  | 'g' | 'G'
  | 'n' | 'b' | 'B' | 'c'
  | 'p' | 'P' | 't';

export const PALETTE_CHARS: PaletteChar[] = [
  'o', 'd', 'm', 'l', 'w', 'r', 'R', 'y', 'g', 'G', 'n', 'b', 'B', 'c', 'p', 'P', 't',
];

/** Build a char palette from a skin's 17-color ramp. */
export function makePalette(ramp: Record<PaletteChar, string>): Record<string, string> {
  return { ...ramp };
}
