import '@fontsource/press-start-2p';
import * as Phaser from 'phaser';
import { GAME_H, GAME_W } from './constants';
import { ArmoryScene } from './scenes/ArmoryScene';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { MapSelectScene } from './scenes/MapSelectScene';
import { PauseScene } from './scenes/PauseScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SkinSelectScene } from './scenes/SkinSelectScene';
import { ResultScene } from './scenes/ResultScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#05060f',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Order matters: later scenes render on top (HUD over Game, Pause over both).
  scene: [BootScene, PreloadScene, SkinSelectScene, MapSelectScene, ArmoryScene, GameScene, HUDScene, PauseScene, ResultScene],
});

if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
