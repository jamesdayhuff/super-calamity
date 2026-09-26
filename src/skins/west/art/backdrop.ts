import type * as Phaser from 'phaser';
import { GAME_H, GAME_W } from '../../../constants';
import { mulberry32 } from '../../../util/rng';
import { WEST_UI_PALETTE } from './palette';

const DUST_COLORS = [0x7a5230, 0xb89268, 0xf2e3c4];

/**
 * Dusk over the territory: a banded sunset, mesa silhouettes on the horizon and dust drifting
 * across on the wind. The counterpart to Space's starfield.
 */
export function westBackdrop(scene: Phaser.Scene, seed = 7): void {
  scene.add.rectangle(0, 0, GAME_W, GAME_H, WEST_UI_PALETTE.bg).setOrigin(0);
  const rand = mulberry32(seed);

  // Sunset, kept low so the title and menu text always sit on plain dark sky. Many thin bands
  // with a rising alpha read as a gradient rather than as stripes.
  const HORIZON = 230;
  const stops = [0x2a1a20, 0x4a2a3a, 0x8a5a6a, 0xc85a2e, 0xf0c040];
  const BANDS = 14;
  for (let i = 0; i < BANDS; i++) {
    const t = i / (BANDS - 1);
    const color = stops[Math.min(stops.length - 1, Math.floor(t * stops.length))];
    scene.add.rectangle(0, HORIZON - (BANDS - i) * 3, GAME_W, 3, color, 0.12 + t * 0.34).setOrigin(0);
  }

  // Mesa silhouettes along the horizon.
  let x = -10;
  while (x < GAME_W) {
    const w = 34 + rand() * 60;
    const h = 12 + rand() * 26;
    scene.add.rectangle(x, HORIZON, w, h, 0x241812, 0.9).setOrigin(0, 1);
    // A stepped shoulder, so the skyline is not a row of plain blocks.
    scene.add.rectangle(x + w * 0.6, HORIZON, w * 0.5, h * 0.6, 0x241812, 0.9).setOrigin(0, 1);
    x += w + 8 + rand() * 24;
  }
  scene.add.rectangle(0, HORIZON, GAME_W, GAME_H - HORIZON, 0x1a1109, 1).setOrigin(0);

  // Dust motes blowing across.
  for (let i = 0; i < 40; i++) {
    const mote = scene.add
      .rectangle(Math.floor(rand() * GAME_W), Math.floor(rand() * GAME_H), 1, 1, DUST_COLORS[Math.floor(rand() * DUST_COLORS.length)], 0.7)
      .setOrigin(0);
    scene.tweens.add({
      targets: mote,
      x: { from: -4, to: GAME_W + 4 },
      y: `+=${-6 + rand() * 12}`,
      duration: 5000 + rand() * 9000,
      delay: rand() * 7000,
      repeat: -1,
    });
  }
}
