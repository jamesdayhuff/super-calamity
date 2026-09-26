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

function bevel(plot: TilePlot, light: string, dark: string) {
  for (let i = 0; i < SIZE; i++) {
    plot(i, 0, light);
    plot(0, i, light);
    plot(i, SIZE - 1, dark);
    plot(SIZE - 1, i, dark);
  }
}

/** Procedurally draw one 16x16 tile. Deterministic per (theme, variant). */
export function drawSpaceTile(plot: TilePlot, theme: string, variant: TileVariant): void {
  const rand = mulberry32(theme.length * 997 + variant.length * 131 + variant.charCodeAt(variant.length - 1));

  if (variant === 'void') {
    fill(plot, '#05060f');
    for (let i = 0; i < 5; i++) {
      plot(Math.floor(rand() * SIZE), Math.floor(rand() * SIZE), pick(rand, ['#566c86', '#94b0c2', '#f4f4f4']));
    }
    return;
  }

  switch (theme) {
    case 'station': {
      if (variant === 'path') {
        fill(plot, '#1a1c2c');
        for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if ((x + y) % 4 === 0) plot(x, y, '#29366f');
        return;
      }
      fill(plot, '#333c57');
      bevel(plot, '#566c86', '#1a1c2c');
      for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) plot(x, y, '#94b0c2');
      if (variant === 'floor_1') for (let x = 4; x < 12; x++) for (const y of [5, 8, 11]) plot(x, y, '#1a1c2c');
      if (variant === 'floor_2') for (let x = 3; x < 13; x++) plot(x, 7, (x >> 1) % 2 ? '#ffcd75' : '#1a1c2c');
      return;
    }
    case 'asteroid': {
      if (variant === 'path') {
        dither(plot, rand, ['#8a6f5a', '#a88a6a', '#6b4f4f'], [0.55, 0.3, 0.15]);
        return;
      }
      dither(plot, rand, ['#4a3b3b', '#5a4646', '#3b2e2e'], [0.5, 0.3, 0.2]);
      if (variant === 'floor_1') {
        for (let a = 0; a < 20; a++) {
          const t = (a / 20) * Math.PI * 2;
          plot(Math.round(8 + Math.cos(t) * 4), Math.round(8 + Math.sin(t) * 3), '#2a2020');
        }
      }
      if (variant === 'floor_2') for (let i = 0; i < 3; i++) plot(4 + i * 4, 5 + i * 3, '#73eff7');
      return;
    }
    case 'derelict': {
      if (variant === 'path') {
        fill(plot, '#141c1c');
        for (let x = 0; x < SIZE; x += 4) plot(x, 0, '#1f2a2a');
        plot(7, 7, '#b13e53');
        return;
      }
      fill(plot, '#2b3b3a');
      bevel(plot, '#3a4f4c', '#1f2a2a');
      if (variant === 'floor_1') for (let i = 0; i < 6; i++) plot(3 + Math.floor(rand() * 10), 3 + Math.floor(rand() * 10), '#7a4a2a');
      if (variant === 'floor_2') for (let i = 2; i < 13; i++) plot(i, Math.round(4 + i * 0.6), '#1f2a2a');
      return;
    }
    case 'planet': {
      if (variant === 'path') {
        fill(plot, '#5a4a4a');
        for (let i = 0; i < SIZE; i++) {
          plot(i, 0, '#4a3a3a');
          plot(0, i, '#4a3a3a');
          plot(i, 8, '#4a3a3a');
          plot(8, i, '#4a3a3a');
        }
        return;
      }
      dither(plot, rand, ['#a85a45', '#8f4a3a', '#c06b50'], [0.5, 0.3, 0.2]);
      if (variant === 'floor_1') for (let x = 0; x < SIZE; x++) plot(x, Math.round(6 + Math.sin(x / 2.5) * 2), '#c06b50');
      if (variant === 'floor_2') for (let i = 0; i < 4; i++) plot(3 + i * 3, 11 - (i % 2), '#6e2f2a');
      return;
    }
    default: {
      // orbital
      if (variant === 'path') {
        fill(plot, '#29366f');
        for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (x % 8 === 3 && y % 8 === 3) plot(x, y, '#41a6f6');
        return;
      }
      fill(plot, '#94b0c2');
      bevel(plot, '#c3d3de', '#566c86');
      if (variant === 'floor_1') for (let i = 4; i < 12; i++) plot(i, 8, '#566c86');
      if (variant === 'floor_2') {
        for (let y = 5; y < 11; y++) for (let x = 5; x < 11; x++) plot(x, y, (x + y) % 2 ? '#3b5dc9' : '#41a6f6');
      }
      return;
    }
  }
}
