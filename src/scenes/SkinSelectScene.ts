import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import { bakePreviewTextures, bakeSkinTextures, clearSkinTextures, firstFrame } from '../assets/SpriteFactory';
import { GAME_H, GAME_TITLE, GAME_W, SCENES } from '../constants';
import { previewKey } from '../skins/keys';
import { activeSkinId, getSkin, setActiveSkin, skin } from '../skins/registry';
import { SKIN_IDS, type SkinId } from '../skins/types';
import { progression } from '../state';
import { addText, applySkinPalette, Button, COLORS, drawPanel } from '../ui/widgets';

const CARD_W = 148;
const CARD_H = 158;
const GAP = 8;

/**
 * Pick which world to play. Switching re-bakes every texture, so this scene rebuilds itself rather
 * than handing a half-swapped atlas to the menus.
 */
export class SkinSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENES.skinSelect);
  }

  create(): void {
    const active = activeSkinId();
    applySkinPalette(skin().palette);
    skin().backdrop(this, 5);
    audio.playMusic('menu');

    addText(this, GAME_W / 2, 16, GAME_TITLE, { size: 16, color: COLORS.gold, originX: 0.5 });
    addText(this, GAME_W / 2, 38, 'CHOOSE YOUR WORLD', { color: COLORS.dim, originX: 0.5 });

    const x0 = (GAME_W - (SKIN_IDS.length * CARD_W + (SKIN_IDS.length - 1) * GAP)) / 2;
    const y = 56;

    SKIN_IDS.forEach((id, i) => {
      const s = getSkin(id);
      const x = x0 + i * (CARD_W + GAP);
      const isActive = id === active;
      const p = progression.data.skins[id];

      const card = new Button(this, x, y, CARD_W, CARD_H, { sfx: null, onClick: () => this.choose(id) });
      card.setSelected(isActive);

      // Palette swatch: five bands of this world's own colors, so the cards read as different
      // places even before you can see their sprites.
      const g = this.add.graphics();
      [s.palette.bg, s.palette.panel, s.palette.panelHi, s.palette.border, s.palette.borderHi].forEach((c, j) => {
        g.fillStyle(c, 1).fillRect(x + 8 + j * 26, y + 8, 24, 6);
      });

      const key = previewKey(id);
      if (this.textures.exists(key)) {
        const img = this.add.image(x + CARD_W / 2, y + 44, key, firstFrame(this.textures, key));
        img.setScale(Math.min(2.5, 40 / Math.max(img.width, img.height)));
      }

      addText(this, x + CARD_W / 2, y + 68, s.name, { color: isActive ? COLORS.gold : COLORS.text, originX: 0.5, align: 'center', wrap: CARD_W - 12 });
      addText(this, x + CARD_W / 2, y + 86, s.strings.tagline, {
        color: COLORS.dim,
        originX: 0.5,
        align: 'center',
        wrap: CARD_W - 16,
      });

      const cleared = p.completedMaps.length;
      addText(this, x + 8, y + CARD_H - 32, s.strings.levelNounPlural, { color: COLORS.faint });
      addText(this, x + CARD_W - 8, y + CARD_H - 32, `${cleared}/${s.maps.length}`, {
        color: cleared ? COLORS.green : COLORS.faint,
        originX: 1,
      });

      new Button(this, x + 8, y + CARD_H - 20, CARD_W - 16, 14, {
        label: isActive ? 'CONTINUE' : 'PLAY',
        color: isActive ? COLORS.green : COLORS.cyan,
        sfx: null,
        onClick: () => this.choose(id),
      });
    });

    const g = this.add.graphics();
    drawPanel(g, 16, GAME_H - 22, GAME_W - 32, 16);
    addText(this, GAME_W / 2, GAME_H - 18, 'EACH WORLD KEEPS ITS OWN UNLOCKS AND PROGRESS', {
      color: COLORS.faint,
      originX: 0.5,
    });
  }

  private choose(id: SkinId): void {
    audio.play('click', 0);
    if (setActiveSkin(id)) {
      progression.setSkin(id);
      const s = skin();
      applySkinPalette(s.palette);
      // Texture keys are shared between skins, so the old set must go before the new one is baked.
      clearSkinTextures(this);
      bakeSkinTextures(this, s);
      bakePreviewTextures(this);
      audio.stopMusic();
      audio.resetMusicMemo();
      this.scene.start(SCENES.skinSelect);
      return;
    }
    this.scene.start(SCENES.mapSelect);
  }
}
