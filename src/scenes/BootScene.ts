import * as Phaser from 'phaser';
import { FONT, GAME_H, GAME_W, SCENES } from '../constants';
import { setActiveSkin } from '../skins/registry';
import { progression } from '../state';

/** Waits for the pixel font so no text renders in a fallback face, then hands off to Preload. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    // Restore the world the player last chose before anything reads skin content.
    setActiveSkin(progression.data.activeSkin);
    this.add.text(GAME_W / 2, GAME_H / 2, 'LOADING...', { fontFamily: 'monospace', fontSize: '8px', color: '#94b0c2' }).setOrigin(0.5);
    const timeout = new Promise((r) => setTimeout(r, 3000));
    const fonts = Promise.all([document.fonts.load(`8px ${FONT}`), document.fonts.load(`16px ${FONT}`)]);
    Promise.race([fonts, timeout]).finally(() => this.scene.start(SCENES.preload));
  }
}
