/**
 * Pixel-art definition: each frame is an array of row strings; each char maps through the palette
 * to a CSS color. '.' and ' ' are transparent. Mirroring lets symmetric art be authored as a half/quadrant.
 */
export interface PixelArt {
  palette: Record<string, string>;
  frames: string[][];
  /** Each row is the left half; it is mirrored to produce the right half. */
  mirrorX?: boolean;
  /** Rows are the top half; they are mirrored to produce the bottom half. */
  mirrorY?: boolean;
}

export const TRANSPARENT = 'transparent';

export function expandFrame(rows: string[], mirrorX = false, mirrorY = false): string[] {
  let out = mirrorX ? rows.map((r) => r + [...r].reverse().join('')) : [...rows];
  if (mirrorY) out = out.concat([...out].reverse());
  return out;
}

export function expandArt(art: PixelArt): { frames: string[][]; w: number; h: number } {
  const frames = art.frames.map((f) => expandFrame(f, art.mirrorX, art.mirrorY));
  const w = Math.max(...frames.flatMap((f) => f.map((r) => r.length)));
  const h = Math.max(...frames.map((f) => f.length));
  return { frames, w, h };
}

/** Return a copy of the art with some palette entries replaced (palette swap). */
export function recolor(art: PixelArt, overrides: Record<string, string>): PixelArt {
  return { ...art, palette: { ...art.palette, ...overrides } };
}
