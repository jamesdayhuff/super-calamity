import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import { GAME_H, GAME_W, SCENES } from '../constants';
import { skin } from '../skins/registry';
import { progression } from '../state';
import { addText, Button, COLORS, drawMeter, drawPanel, numColor } from '../ui/widgets';
import type { GameScene } from './GameScene';

export class PauseScene extends Phaser.Scene {
  private meters!: Phaser.GameObjects.Graphics;
  private muteBtn!: Button;
  private unsub: (() => void) | null = null;

  constructor() {
    super(SCENES.pause);
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.scrim, 0.7).setOrigin(0).setInteractive();
    const w = 200;
    const h = 164;
    const x = (GAME_W - w) / 2;
    const y = (GAME_H - h) / 2;
    const g = this.add.graphics();
    drawPanel(g, x, y, w, h);
    addText(this, GAME_W / 2, y + 8, 'PAUSED', { size: 16, color: COLORS.gold, originX: 0.5 });

    new Button(this, x + 20, y + 32, w - 40, 16, { label: 'RESUME', color: COLORS.green, onClick: () => this.resume() });

    addText(this, x + 20, y + 58, 'MUSIC', { color: COLORS.dim });
    new Button(this, x + 76, y + 55, 12, 12, { label: '-', onClick: () => audio.setMusicVolume(progression.data.settings.musicVolume - 0.1) });
    new Button(this, x + 146, y + 55, 12, 12, { label: '+', onClick: () => audio.setMusicVolume(progression.data.settings.musicVolume + 0.1) });
    addText(this, x + 20, y + 76, 'SFX', { color: COLORS.dim });
    new Button(this, x + 76, y + 73, 12, 12, { label: '-', onClick: () => audio.setSfxVolume(progression.data.settings.sfxVolume - 0.1) });
    new Button(this, x + 146, y + 73, 12, 12, { label: '+', onClick: () => audio.setSfxVolume(progression.data.settings.sfxVolume + 0.1) });
    this.meters = this.add.graphics();
    this.muteBtn = new Button(this, x + 20, y + 92, w - 40, 14, { label: '', onClick: () => audio.toggleMute() });

    const st = skin().strings;
    const gs = this.scene.get(SCENES.game) as GameScene;
    new Button(this, x + 20, y + 114, w - 40, 14, { label: `RESTART ${st.levelNoun}`, onClick: () => this.leave(gs, 'retry') });
    new Button(this, x + 20, y + 132, w - 40, 14, { label: `QUIT TO ${st.levelNounPlural}`, color: COLORS.red, onClick: () => this.leave(gs, 'menu') });
    addText(this, GAME_W / 2, y + h - 10, 'ESC TO RESUME', { color: COLORS.faint, originX: 0.5 });

    this.unsub = progression.events.on('change', () => this.refresh());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsub?.());
    this.input.keyboard?.on('keydown-ESC', () => this.resume());
    this.input.keyboard?.on('keydown-P', () => this.resume());
    this.refresh();
  }

  private refresh(): void {
    const s = progression.data.settings;
    const cx = (GAME_W - 200) / 2;
    const cy = (GAME_H - 164) / 2;
    this.meters.clear();
    drawMeter(this.meters, cx + 92, cy + 57, s.musicVolume, 10, numColor(COLORS.cyan));
    drawMeter(this.meters, cx + 92, cy + 75, s.sfxVolume, 10, numColor(COLORS.green));
    this.muteBtn.setLabel(s.muted ? 'SOUND: OFF' : 'SOUND: ON', s.muted ? COLORS.red : COLORS.text);
  }

  private resume(): void {
    this.scene.resume(SCENES.game);
    this.scene.resume(SCENES.hud);
    this.scene.stop();
  }

  private leave(gs: GameScene, then: 'menu' | 'retry'): void {
    this.scene.stop();
    gs.abandon(then);
  }
}
