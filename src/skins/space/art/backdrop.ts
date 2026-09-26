import type * as Phaser from 'phaser';
import { GAME_H, GAME_W } from '../../../constants';
import { mulberry32 } from '../../../util/rng';
import { SPACE_UI_PALETTE } from './palette';

const STAR_COLORS = [0x566c86, 0x94b0c2, 0xf4f4f4, 0x73eff7];

/** Seeded starfield: 90 single pixels, ~30% of which twinkle. */
export function spaceBackdrop(scene: Phaser.Scene, seed = 7): void {
  scene.add.rectangle(0, 0, GAME_W, GAME_H, SPACE_UI_PALETTE.bg).setOrigin(0);
  const rand = mulberry32(seed);
  for (let i = 0; i < 90; i++) {
    const star = scene.add
      .rectangle(Math.floor(rand() * GAME_W), Math.floor(rand() * GAME_H), 1, 1, STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)])
      .setOrigin(0);
    if (rand() < 0.3) {
      scene.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: 600 + rand() * 1400,
        delay: rand() * 1000,
        yoyo: true,
        repeat: -1,
      });
    }
  }
}
