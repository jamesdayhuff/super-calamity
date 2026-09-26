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

/** Wagon ruts worn into a dirt trail. */
function trail(plot: TilePlot, rand: () => number, base: string, rut: string, stone: string) {
  fill(plot, base);
  for (let y = 0; y < SIZE; y++) {
    for (const cx of [3, 11]) plot(cx + (rand() < 0.25 ? 1 : 0), y, rut);
  }
  for (let i = 0; i < 4; i++) plot(Math.floor(rand() * SIZE), Math.floor(rand() * SIZE), stone);
}

/** Procedurally draw one 16x16 tile. Deterministic per (theme, variant). */
export function drawWestTile(plot: TilePlot, theme: string, variant: TileVariant): void {
  const rand = mulberry32(theme.length * 733 + variant.length * 151 + variant.charCodeAt(variant.length - 1));

  if (variant === 'void') {
    fill(plot, '#140d07');
    for (let i = 0; i < 5; i++) plot(Math.floor(rand() * SIZE), Math.floor(rand() * SIZE), pick(rand, ['#47301f', '#7a5230']));
    return;
  }

  switch (theme) {
    case 'mainstreet': {
      // Town: a pale dirt street running between dark boardwalks — the street has to read as the
      // lane at a glance, so the decking is kept several steps darker.
      if (variant === 'path') return trail(plot, rand, '#b08a55', '#8a6a3c', '#6b5230');
      fill(plot, '#4a3222');
      for (let y = 0; y < SIZE; y += 4) for (let x = 0; x < SIZE; x++) plot(x, y, '#2e1f14');
      for (let y = 0; y < SIZE; y++) plot(7, y, '#2e1f14');
      if (variant === 'floor_1') for (let x = 2; x < 14; x++) plot(x, 9, '#63452c');
      if (variant === 'floor_2') for (let i = 0; i < 4; i++) plot(3 + i * 3, 5, '#241812');
      return;
    }
    case 'canyon': {
      // Red rock walls and shadow.
      if (variant === 'path') return trail(plot, rand, '#b07a4a', '#8a5a32', '#6b4326');
      dither(plot, rand, ['#8a4030', '#6e3224', '#a8523c'], [0.5, 0.3, 0.2]);
      if (variant === 'floor_1') for (let y = 0; y < SIZE; y++) plot(Math.round(7 + Math.sin(y / 3) * 3), y, '#4a1f18');
      if (variant === 'floor_2') for (let i = 0; i < 5; i++) plot(2 + i * 3, 3 + ((i * 4) % 10), '#c07a5a');
      return;
    }
    case 'goldmine': {
      // Mine floor: tailings, sleepers and a glint of ore.
      if (variant === 'path') {
        fill(plot, '#5c4326');
        for (let x = 0; x < SIZE; x += 4) for (let y = 0; y < SIZE; y++) plot(x, y, '#3d2a1a');
        for (let x = 0; x < SIZE; x++) {
          plot(x, 5, '#47301f');
          plot(x, 10, '#47301f');
        }
        return;
      }
      dither(plot, rand, ['#4a3a2a', '#5c4326', '#3a2c1e'], [0.5, 0.3, 0.2]);
      if (variant === 'floor_1') for (let i = 0; i < 6; i++) plot(2 + Math.floor(rand() * 12), 2 + Math.floor(rand() * 12), '#7a5230');
      if (variant === 'floor_2') for (let i = 0; i < 3; i++) plot(4 + i * 4, 6 + (i % 3), '#f0c040');
      return;
    }
    case 'prairie': {
      // Open grassland going to seed.
      if (variant === 'path') return trail(plot, rand, '#a8894e', '#856a38', '#63512a');
      dither(plot, rand, ['#7f8a4a', '#6b7a3d', '#94a05a'], [0.5, 0.32, 0.18]);
      if (variant === 'floor_1') for (let x = 0; x < SIZE; x += 3) plot(x, 4 + ((x * 3) % 9), '#b8c078');
      if (variant === 'floor_2') for (let i = 0; i < 4; i++) plot(3 + i * 4, 9 - (i % 3), '#5c4326');
      return;
    }
    default: {
      // Rail junction: ballast, sleepers and steel.
      if (variant === 'path') {
        fill(plot, '#6b5a42');
        for (let y = 0; y < SIZE; y += 4) for (let x = 0; x < SIZE; x++) plot(x, y, '#47301f');
        for (let y = 0; y < SIZE; y++) {
          plot(4, y, '#7d8f9c');
          plot(11, y, '#7d8f9c');
        }
        return;
      }
      dither(plot, rand, ['#8a7a5a', '#6b5a42', '#a08e6a'], [0.5, 0.3, 0.2]);
      if (variant === 'floor_1') for (let x = 0; x < SIZE; x++) plot(x, 8, '#4a5560');
      if (variant === 'floor_2') for (let i = 0; i < 4; i++) plot(2 + i * 4, 4 + (i % 4), '#47301f');
      return;
    }
  }
}
