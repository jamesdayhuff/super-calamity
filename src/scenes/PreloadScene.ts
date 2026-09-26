import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import { AUDIO_FILES, TEXTURE_FILES } from '../assets/manifest';
import { bakePreviewTextures, bakeSkinTextures, firstFrame } from '../assets/SpriteFactory';
import { GAME_H, GAME_TITLE, GAME_W, SCENES } from '../constants';
import { TEX } from '../skins/keys';
import { skin } from '../skins/registry';
import { progression } from '../state';
import { addText, applySkinPalette, COLORS } from '../ui/widgets';

/** Loads any file-based asset overrides, bakes the active skin's textures, then shows the title. */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.preload);
  }

  preload(): void {
    for (const [key, f] of Object.entries(TEXTURE_FILES)) {
      if (f.frameWidth) this.load.spritesheet(key, f.url, { frameWidth: f.frameWidth, frameHeight: f.frameHeight ?? f.frameWidth });
      else this.load.image(key, f.url);
    }
    for (const [key, url] of Object.entries(AUDIO_FILES)) this.load.audio(key, url);
  }

  create(): void {
    const s = skin();
    applySkinPalette(s.palette);
    bakeSkinTextures(this, s);
    bakePreviewTextures(this);
    audio.attachPhaser(this.sound);

    s.backdrop(this, 42);
    const hero = this.add.sprite(GAME_W / 2, 84, TEX.base, firstFrame(this.textures, TEX.base)).setScale(3);
    if (this.anims.exists(`${TEX.base}_anim`)) hero.play(`${TEX.base}_anim`);
    addText(this, GAME_W / 2, 132, GAME_TITLE, { size: 16, color: COLORS.gold, originX: 0.5 });
    addText(this, GAME_W / 2, 154, s.strings.subtitle, { color: COLORS.cyan, originX: 0.5 });
    addText(this, GAME_W / 2, 172, s.strings.tagline, { color: COLORS.dim, originX: 0.5 });
    const prompt = addText(this, GAME_W / 2, 206, 'CLICK TO START', { color: COLORS.text, originX: 0.5 });
    this.tweens.add({ targets: prompt, alpha: 0.15, duration: 500, yoyo: true, repeat: -1 });
    addText(this, GAME_W / 2, GAME_H - 14, '1-7 BUILD  SPACE WAVE  U UPGRADE  S SELL  F SPEED  P PAUSE', {
      color: COLORS.faint,
      originX: 0.5,
    });

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      audio.unlock();
      audio.play('click', 0);
      // Returning players go straight to the world they last played.
      this.scene.start(progression.data.skins[progression.skinId].completedMaps.length ? SCENES.mapSelect : SCENES.skinSelect);
    };
    this.input.once(Phaser.Input.Events.POINTER_DOWN, start);
    this.input.keyboard?.once('keydown', start);
  }
}
