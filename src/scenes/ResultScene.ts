import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import { GAME_W, SCENES } from '../constants';
import { skin } from '../skins/registry';
import { progression } from '../state';
import { addText, Button, COLORS, drawPanel } from '../ui/widgets';
import type { ResultData } from './GameScene';

export class ResultScene extends Phaser.Scene {
  private result!: ResultData;

  constructor() {
    super(SCENES.result);
  }

  init(data: ResultData): void {
    this.result = data;
  }

  create(): void {
    const { victory, payout, stats, mapIndex, nextUnlocked } = this.result;
    const s = skin();
    const st = s.strings;
    const map = s.maps[mapIndex];
    s.backdrop(this, victory ? 3 : 9);
    audio.playMusic('menu');

    const w = 300;
    const x = (GAME_W - w) / 2;
    const y = 20;
    const g = this.add.graphics();
    drawPanel(g, x, y, w, 230);

    addText(this, GAME_W / 2, y + 10, victory ? 'VICTORY' : 'DEFEAT', { size: 16, color: victory ? COLORS.green : COLORS.red, originX: 0.5 });
    addText(this, GAME_W / 2, y + 32, `${st.levelNoun} ${mapIndex + 1}: ${map.name.toUpperCase()}`, { color: COLORS.dim, originX: 0.5 });

    const rows: Array<[string, string, string?]> = [
      ['WAVES SURVIVED', `${stats.wavesCleared}/${stats.totalWaves}`],
      ['ENEMIES DESTROYED', `${stats.kills}`],
      [`${st.cashName} EARNED`, `${stats.cashEarned}`, COLORS.gold],
      [st.leakLabel, `${stats.leaks}`, stats.leaks ? COLORS.red : COLORS.green],
    ];
    rows.forEach(([label, value, color], i) => {
      addText(this, x + 20, y + 52 + i * 12, label, { color: COLORS.dim });
      addText(this, x + w - 20, y + 52 + i * 12, value, { color: color ?? COLORS.text, originX: 1 });
    });

    const my = y + 108;
    g.fillStyle(COLORS.border, 1).fillRect(x + 16, my - 4, w - 32, 1);
    addText(this, x + 20, my + 2, `${st.metaCurrency} FROM WAVES`, { color: COLORS.dim });
    addText(this, x + w - 20, my + 2, `+${payout.waves}`, { color: COLORS.cyan, originX: 1 });
    if (victory) {
      addText(this, x + 20, my + 14, payout.firstClear ? 'FIRST CLEAR BONUS' : 'REPLAY BONUS', { color: COLORS.dim });
      addText(this, x + w - 20, my + 14, `+${payout.clearBonus}`, { color: COLORS.cyan, originX: 1 });
    }
    addText(this, x + 20, my + 30, 'TOTAL AWARDED', { color: COLORS.text });
    const total = addText(this, x + w - 20, my + 30, `+${payout.total}`, { color: COLORS.cyan, originX: 1 });
    this.tweens.add({ targets: total, scale: { from: 1.6, to: 1 }, duration: 400, ease: 'Back.Out' });
    addText(this, x + w - 20, my + 42, `BALANCE ${progression.current.metaCurrency}`, { color: COLORS.faint, originX: 1 });

    if (nextUnlocked) {
      const t = addText(this, GAME_W / 2, my + 60, `NEW ${st.levelNoun}: ${s.maps[mapIndex + 1].name.toUpperCase()}`, { color: COLORS.gold, originX: 0.5 });
      this.tweens.add({ targets: t, alpha: 0.4, duration: 500, yoyo: true, repeat: -1 });
      audio.play('unlock', 0);
    } else if (victory && mapIndex === s.maps.length - 1 && payout.firstClear) {
      addText(this, GAME_W / 2, my + 60, st.endingText, { color: COLORS.gold, originX: 0.5, align: 'center', wrap: w - 24 });
    }

    const by = y + 206;
    new Button(this, x + 12, by, 88, 16, { label: 'RETRY', onClick: () => this.scene.start(SCENES.game, { mapIndex }) });
    new Button(this, x + 106, by, 88, 16, { label: st.armoryLabel, color: COLORS.cyan, onClick: () => this.scene.start(SCENES.armory) });
    new Button(this, x + 200, by, 88, 16, { label: st.levelsTabLabel, color: COLORS.green, onClick: () => this.scene.start(SCENES.mapSelect) });
  }
}
