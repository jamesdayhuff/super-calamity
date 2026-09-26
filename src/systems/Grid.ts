import type { MapDef } from '../balance/types';
import { mulberry32 } from '../util/rng';

export type CellKind = 'build' | 'path' | 'blocked' | 'decor';

export interface GridLayout {
  cols: number;
  rows: number;
  cells: CellKind[][]; // [row][col]
  /** Path tiles within the grid, in travel order (may repeat at corners). */
  pathTiles: Array<[number, number]>;
  base: [number, number];
}

/** Rasterize orthogonal waypoint segments into tile coordinates (including off-grid ones). */
export function rasterizePath(waypoints: Array<[number, number]>): Array<[number, number]> {
  const tiles: Array<[number, number]> = [];
  for (let i = 1; i < waypoints.length; i++) {
    const [c0, r0] = waypoints[i - 1];
    const [c1, r1] = waypoints[i];
    if (c0 !== c1 && r0 !== r1) {
      throw new Error(`Path segment ${i} is not orthogonal: [${c0},${r0}] -> [${c1},${r1}]`);
    }
    const steps = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0));
    const dc = Math.sign(c1 - c0);
    const dr = Math.sign(r1 - r0);
    for (let s = i === 1 ? 0 : 1; s <= steps; s++) tiles.push([c0 + dc * s, r0 + dr * s]);
  }
  return tiles;
}

/**
 * Build the tile grid for a map: path tiles, a blocked 3x3 footprint around the core,
 * and decorative (non-buildable) props scattered only far from the path.
 */
export function buildGrid(map: MapDef, cols: number, rows: number, decorDensity = 0.22): GridLayout {
  const cells: CellKind[][] = Array.from({ length: rows }, () => Array<CellKind>(cols).fill('build'));
  const inGrid = (c: number, r: number) => c >= 0 && r >= 0 && c < cols && r < rows;

  const allPath = rasterizePath(map.waypoints);
  const pathTiles = allPath.filter(([c, r]) => inGrid(c, r));
  for (const [c, r] of pathTiles) cells[r][c] = 'path';

  const base = map.waypoints[map.waypoints.length - 1];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const c = base[0] + dc;
      const r = base[1] + dr;
      if (inGrid(c, r) && cells[r][c] === 'build') cells[r][c] = 'blocked';
    }
  }

  // Decor only where the nearest path tile is >= 3 tiles away (Chebyshev), so it never steals useful spots.
  const rand = mulberry32(map.seed);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] !== 'build') continue;
      const near = pathTiles.some(([pc, pr]) => Math.max(Math.abs(pc - c), Math.abs(pr - r)) < 3);
      if (!near && rand() < decorDensity) cells[r][c] = 'decor';
    }
  }

  return { cols, rows, cells, pathTiles, base };
}
