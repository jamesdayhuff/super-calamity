import { TILE_SIZE as SIZE, type TileVariant } from '../../../assets/tileTypes';
import { mulberry32 } from '../../../util/rng';
import type { TilePlot } from '../../types';

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function fill(plot: TilePlot, color: string) {
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) plot(x, y, color);
}

function dither(plot: TilePlot, rand: () => number, colors: string[], weights: number[]) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let r = rand();
      let i = 0;
      while (i < weights.length - 1 && r > weights[i]) r -= weights[i++];
      plot(x, y, colors[i]);
    }
  }
}

/** Churned ruts down the middle of a supply road. */
function ruts(plot: TilePlot, rand: () => number, base: string, rut: string, edge: string) {
  fill(plot, base);
  for (let y = 0; y < SIZE; y++) {
    for (const cx of [4, 11]) {
      const x = cx + (rand() < 0.3 ? 1 : 0);
      plot(x, y, rut);
      plot(x + 1, y, rut);
    }
  }
  for (let x = 0; x < SIZE; x++) if (rand() < 0.25) plot(x, Math.floor(rand() * SIZE), edge);
}

/** Procedurally draw one 16x16 tile. Deterministic per (theme, variant). */
export function drawWw2Tile(plot: TilePlot, theme: string, variant: TileVariant): void {
  const rand = mulberry32(theme.length * 613 + variant.length * 181 + variant.charCodeAt(variant.length - 1));

  if (variant === 'void') {
    fill(plot, '#0a0c06');
    for (let i = 0; i < 6; i++) plot(Math.floor(rand() * SIZE), Math.floor(rand() * SIZE), pick(rand, ['#2b2e22', '#4a4f3a']));
    return;
  }

  switch (theme) {
    case 'hedgerow': {
      // Normandy: deep green fields hemmed by earth banks.
      if (variant === 'path') return ruts(plot, rand, '#6e5a48', '#4a3b2a', '#3a2f2a');
      dither(plot, rand, ['#2f4429', '#3a5230', '#26381f'], [0.5, 0.32, 0.18]);
      if (variant === 'floor_1') for (let x = 0; x < SIZE; x++) plot(x, Math.round(7 + Math.sin(x / 3) * 2), '#6b8f3f');
      if (variant === 'floor_2') for (let i = 0; i < 5; i++) plot(3 + i * 3, 4 + ((i * 5) % 9), '#6b8f3f');
      return;
    }
    case 'stalingrad': {
      // Ruined city: broken concrete slabs and brick dust.
      if (variant === 'path') return ruts(plot, rand, '#5a5346', '#3d3830', '#2b2820');
      fill(plot, '#4a4a44');
      for (let i = 0; i < SIZE; i++) {
        plot(i, 0, '#63635a');
        plot(0, i, '#63635a');
        plot(i, SIZE - 1, '#2b2820');
        plot(SIZE - 1, i, '#2b2820');
      }
      if (variant === 'floor_1') for (let i = 0; i < 8; i++) plot(2 + Math.floor(rand() * 12), 2 + Math.floor(rand() * 12), '#6b2b1e');
      if (variant === 'floor_2') for (let i = 3; i < 13; i++) plot(i, Math.round(3 + i * 0.7), '#2b2820');
      return;
    }
    case 'ardennes': {
      // Winter forest: snow over frozen mud.
      if (variant === 'path') return ruts(plot, rand, '#8f9296', '#5a5f63', '#6e5a48');
      dither(plot, rand, ['#c6cbd0', '#b0b7bd', '#d8dde2'], [0.55, 0.28, 0.17]);
      if (variant === 'floor_1') {
        for (let a = 0; a < 14; a++) plot(Math.round(8 + Math.cos(a) * 4), Math.round(8 + Math.sin(a) * 4), '#2f4429');
      }
      if (variant === 'floor_2') for (let i = 0; i < 4; i++) plot(4 + i * 3, 6 + (i % 3), '#5a5f63');
      return;
    }
    case 'desert': {
      // North Africa: sand, shale and tread scars.
      if (variant === 'path') return ruts(plot, rand, '#c2a068', '#9c7f4e', '#7a6338');
      dither(plot, rand, ['#d8b878', '#c2a068', '#e3c891'], [0.5, 0.3, 0.2]);
      if (variant === 'floor_1') for (let x = 0; x < SIZE; x++) plot(x, Math.round(8 + Math.sin(x / 2) * 3), '#9c7f4e');
      if (variant === 'floor_2') for (let i = 0; i < 4; i++) plot(2 + i * 4, 10 - (i % 2), '#7a6338');
      return;
    }
    default: {
      // Rhine crossing: pontoon decking over cold water.
      if (variant === 'path') {
        fill(plot, '#6e5a48');
        for (let x = 0; x < SIZE; x += 4) for (let y = 0; y < SIZE; y++) plot(x, y, '#4a3b2a');
        return;
      }
      fill(plot, '#33454f');
      for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if ((x + y * 2) % 7 === 0) plot(x, y, '#3f5460');
      if (variant === 'floor_1') for (let x = 0; x < SIZE; x++) plot(x, Math.round(5 + Math.sin(x / 2.5) * 2), '#5a7385');
      if (variant === 'floor_2') for (let x = 0; x < SIZE; x++) plot(x, Math.round(11 + Math.cos(x / 2) * 2), '#9db4bf');
      return;
    }
  }
}
