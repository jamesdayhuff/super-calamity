import type * as Phaser from 'phaser';
import { GAME_H, GAME_W } from '../../../constants';
import { mulberry32 } from '../../../util/rng';
import { WW2_UI_PALETTE } from './palette';

const EMBER_COLORS = [0xb5451b, 0xf0a830, 0x6b2b1e];

/**
 * A night sky over the line: drifting smoke banks, slow searchlight columns and a few embers
 * rising. The counterpart to Space's starfield.
 */
export function ww2Backdrop(scene: Phaser.Scene, seed = 7): void {
  scene.add.rectangle(0, 0, GAME_W, GAME_H, WW2_UI_PALETTE.bg).setOrigin(0);
  const rand = mulberry32(seed);

  // Searchlight columns sweeping across the horizon.
  for (let i = 0; i < 3; i++) {
    const x = 60 + i * 150 + rand() * 40;
    const beam = scene.add.triangle(x, GAME_H, 0, 0, -26, -GAME_H, 26, -GAME_H, 0x9db4bf, 0.05).setOrigin(0, 0);
    scene.tweens.add({
      targets: beam,
      angle: { from: -9 + rand() * 4, to: 9 - rand() * 4 },
      duration: 5000 + rand() * 4000,
      delay: rand() * 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  // Smoke banks drifting sideways.
  for (let i = 0; i < 7; i++) {
    const w = 40 + rand() * 90;
    const y = 20 + rand() * (GAME_H - 60);
    const smoke = scene.add.rectangle(rand() * GAME_W, y, w, 3 + rand() * 6, 0x2b2e22, 0.3 + rand() * 0.25).setOrigin(0);
    scene.tweens.add({
      targets: smoke,
      x: { from: -w, to: GAME_W },
      duration: 14000 + rand() * 12000,
      delay: rand() * 6000,
      repeat: -1,
    });
  }

  // Embers rising from off the bottom of the screen.
  for (let i = 0; i < 22; i++) {
    const ember = scene.add
      .rectangle(Math.floor(rand() * GAME_W), Math.floor(rand() * GAME_H), 1, 1, EMBER_COLORS[Math.floor(rand() * EMBER_COLORS.length)])
      .setOrigin(0);
    scene.tweens.add({
      targets: ember,
      y: { from: GAME_H + rand() * 40, to: -10 },
      alpha: { from: 0.9, to: 0 },
      duration: 6000 + rand() * 6000,
      delay: rand() * 6000,
      repeat: -1,
    });
  }
}
