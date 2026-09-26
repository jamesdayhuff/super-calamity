import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import type { TowerArchetype } from '../balance/archetypes';
import { TOWER_ORDER } from '../balance/archetypes';
import { META } from '../balance/economy';
import type { TowerDef } from '../balance/types';
import { GAME_W, SCENES } from '../constants';
import { skin } from '../skins/registry';
import { progression } from '../state';
import { addText, Button, COLORS, drawPanel } from '../ui/widgets';
import { addMenuChrome } from './menuChrome';

type Obj = { destroy: () => void };

/** Meta-progression shop: permanently unlock tower types and their level-3 tier. */
export class ArmoryScene extends Phaser.Scene {
  private detail: Obj[] = [];

  constructor() {
    super(SCENES.armory);
  }

  create(): void {
    audio.playMusic('menu');
    const s = skin();
    addMenuChrome(this, 'armory');
    this.detail = [];

    const cw = 60;
    const gap = 6;
    const x0 = (GAME_W - (TOWER_ORDER.length * cw + (TOWER_ORDER.length - 1) * gap)) / 2;
    const y = 64;
    const h = 112;

    TOWER_ORDER.forEach((id, i) => {
      const def = s.towers[id];
      const x = x0 + i * (cw + gap);
      const owned = progression.isTowerUnlocked(id);
      const tier = progression.isTierUnlocked(id);
      const meta = progression.current.metaCurrency;

      const card = new Button(this, x, y, cw, h, { sfx: null, onClick: () => this.showDetail(def), onHover: (o) => o && this.showDetail(def) });
      card.setSelected(owned);
      const icon = this.add.image(x + cw / 2, y + 20, def.icon).setScale(2);
      if (!owned) icon.setTint(COLORS.panelDeep);
      addText(this, x + cw / 2, y + 40, def.name, { color: owned ? COLORS.text : COLORS.faint, wrap: cw - 4, align: 'center', originX: 0.5 });

      if (owned) {
        addText(this, x + cw / 2, y + 76, 'OWNED', { color: COLORS.green, originX: 0.5 });
      } else {
        const cost = META.towerUnlockCost[id];
        new Button(this, x + 4, y + 72, cw - 8, 16, { label: `${cost}`, color: COLORS.cyan, sfx: null, onClick: () => this.buyTower(id) }).setEnabled(
          meta >= cost,
        );
      }

      if (tier) {
        addText(this, x + cw / 2, y + 98, 'L3 OK', { color: COLORS.gold, originX: 0.5 });
      } else {
        const cost = META.tierUnlockCost[id];
        new Button(this, x + 4, y + 94, cw - 8, 16, { label: `L3 ${cost}`, color: COLORS.gold, sfx: null, onClick: () => this.buyTier(id) }).setEnabled(
          owned && meta >= cost,
        );
      }
    });

    this.showDetail(s.towers[TOWER_ORDER[0]]);
  }

  private buyTower(id: TowerArchetype): void {
    if (progression.unlockTower(id)) {
      audio.play('unlock', 0);
      this.scene.restart();
    } else audio.play('error', 0);
  }

  private buyTier(id: TowerArchetype): void {
    if (progression.unlockTier(id)) {
      audio.play('unlock', 0);
      this.scene.restart();
    } else audio.play('error', 0);
  }

  private showDetail(def: TowerDef): void {
    this.detail.forEach((o) => o.destroy());
    const x = 16;
    const y = 182;
    const w = GAME_W - 32;
    const g = this.add.graphics();
    drawPanel(g, x, y, w, 80);
    const L = def.levels;
    const row = (label: string, f: (i: 0 | 1 | 2) => string | number) => `${label.padEnd(6)}${[0, 1, 2].map((i) => `${f(i as 0 | 1 | 2)}`.padStart(6)).join('')}`;
    const lines = [
      row('', (i) => `L${i + 1}`),
      row('COST', (i) => L[i].cost),
      def.attack === 'support' ? row('BUFF', (i) => `${Math.round((L[i].buff?.fireRate ?? 0) * 100)}%`) : row('DMG', (i) => L[i].damage),
      row('RANGE', (i) => L[i].range),
    ];
    const extra =
      def.attack === 'pulse'
        ? row('SLOW', (i) => `${Math.round((L[i].slow?.factor ?? 0) * 100)}%`)
        : def.attack === 'chain'
          ? row('CHAIN', (i) => L[i].chain?.targets ?? 1)
          : def.attack === 'support'
            ? 'REVEALS HIDDEN FOES'
            : row('RATE', (i) => L[i].fireRate);
    lines.push(extra);

    this.detail = [
      g,
      addText(this, x + 8, y + 8, def.name.toUpperCase(), { color: COLORS.gold }),
      addText(this, x + 8, y + 22, def.blurb, { color: COLORS.dim, wrap: 180 }),
      addText(this, x + 8, y + 50, `DAMAGE: ${def.damageType.toUpperCase()}`, { color: COLORS.faint }),
      addText(this, x + 200, y + 8, lines.join('\n'), { color: COLORS.text }),
    ];
  }
}
