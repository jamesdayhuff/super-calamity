import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import { firstFrame } from '../assets/SpriteFactory';
import { BOSS_ARCHETYPES } from '../balance/archetypes';
import { COLS, GAME_H, ROWS, SCENES } from '../constants';
import { skin } from '../skins/registry';
import { progression } from '../state';
import { buildGrid } from '../systems/Grid';
import { addText, Button, COLORS, drawPanel, numColor } from '../ui/widgets';
import { addMenuChrome } from './menuChrome';

type Obj = { destroy: () => void };

export class MapSelectScene extends Phaser.Scene {
  private selected = 0;
  private rows: Button[] = [];
  private detail: Obj[] = [];

  constructor() {
    super(SCENES.mapSelect);
  }

  create(): void {
    audio.playMusic('menu');
    const s = skin();
    const maps = s.maps;
    addMenuChrome(this, 'levels');
    this.rows = [];
    this.detail = [];

    // Default to the furthest unlocked level.
    this.selected = 0;
    maps.forEach((_, i) => progression.isMapUnlocked(i) && (this.selected = i));

    maps.forEach((map, i) => {
      const y = 64 + i * 34;
      const unlocked = progression.isMapUnlocked(i);
      const done = progression.isMapCompleted(map.id);
      const btn = new Button(this, 16, y, 280, 32, { onClick: () => this.select(i) });
      btn.setEnabled(unlocked);
      this.rows.push(btn);
      addText(this, 24, y + 6, `${i + 1}`, { size: 16, color: unlocked ? COLORS.gold : COLORS.faint });
      addText(this, 48, y + 6, map.name.toUpperCase(), { color: unlocked ? COLORS.text : COLORS.faint });
      addText(this, 48, y + 18, unlocked ? `${map.waves.length} WAVES` : 'LOCKED', { color: COLORS.faint });
      if (!unlocked) this.add.image(284, y + 16, 'icon_lock');
      else if (done) this.add.image(284, y + 16, 'icon_star');
      else {
        const best = progression.current.bestWave[map.id];
        if (best) addText(this, 288, y + 18, `BEST ${best}`, { color: COLORS.faint, originX: 1 });
      }
    });

    addText(this, 16, GAME_H - 12, `CLEAR EACH ${s.strings.levelNoun} TO UNLOCK THE NEXT`, { color: COLORS.faint });
    // One line above the unlock hint, which grows with the world's level noun.
    if (import.meta.env.DEV) addText(this, 464, GAME_H - 24, 'DEV: L=UNLOCK ALL', { color: COLORS.faint, originX: 1 });

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') this.launch();
      if (import.meta.env.DEV && e.key.toLowerCase() === 'l') {
        progression.unlockEverything();
        progression.addMeta(500);
        this.scene.restart();
      }
    });

    this.select(this.selected, false);
  }

  private select(i: number, sound = true): void {
    if (this.selected === i && sound) {
      this.launch();
      return;
    }
    this.selected = i;
    this.rows.forEach((r, j) => r.setSelected(j === i));
    this.buildDetail();
  }

  private launch(): void {
    if (!progression.isMapUnlocked(this.selected)) return;
    audio.play('wave_start', 0);
    audio.stopMusic();
    this.scene.start(SCENES.game, { mapIndex: this.selected });
  }

  private buildDetail(): void {
    this.detail.forEach((o) => o.destroy());
    this.detail = [];
    const s = skin();
    const map = s.maps[this.selected];
    const theme = s.themes[map.theme];
    const x = 304;
    const y = 64;
    const w = 160;
    const h = 168;
    const g = this.add.graphics();
    drawPanel(g, x, y, w, h);
    this.detail.push(g);

    // Minimap: 4px per tile
    const mx = x + 20;
    const my = y + 6;
    const grid = buildGrid(map, COLS, ROWS);
    g.fillStyle(COLORS.bg, 1).fillRect(mx - 1, my - 1, COLS * 4 + 2, ROWS * 4 + 2);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const kind = grid.cells[r][c];
        const color = kind === 'path' ? theme.accent : kind === 'decor' ? COLORS.panel : COLORS.panelDeep;
        g.fillStyle(color, 1).fillRect(mx + c * 4, my + r * 4, 4, 4);
      }
    }
    g.fillStyle(numColor(COLORS.red), 1).fillRect(mx + grid.base[0] * 4, my + grid.base[1] * 4, 4, 4);

    const push = <T extends Obj>(o: T) => (this.detail.push(o), o);
    push(addText(this, x + 6, y + 68, map.name.toUpperCase(), { color: COLORS.gold, wrap: w - 12 }));
    push(addText(this, x + 6, y + 90, map.subtitle, { color: COLORS.dim, wrap: w - 12 }));

    const threats = map.introduces.length ? map.introduces : [BOSS_ARCHETYPES[BOSS_ARCHETYPES.length - 1]];
    push(addText(this, x + 6, y + 114, map.introduces.length ? 'NEW THREATS' : 'FINAL STAND', { color: COLORS.red }));
    threats.forEach((id, i) => {
      const def = s.enemies[id];
      const img = push(this.add.image(x + 14 + i * 20, y + 132, def.sprite, firstFrame(this.textures, def.sprite)));
      img.setScale(Math.min(1, 14 / Math.max(img.width, img.height)));
    });
    push(addText(this, x + w - 6, y + 128, `${map.waves.length} WAVES`, { color: COLORS.faint, originX: 1 }));

    const launch = push(new Button(this, x + 6, y + h - 22, w - 12, 16, { label: s.strings.deployLabel, color: COLORS.green, sfx: null, onClick: () => this.launch() }));
    launch.setEnabled(progression.isMapUnlocked(this.selected));
  }
}
