import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import { firstFrame } from '../assets/SpriteFactory';
import { TOWER_ORDER, type EnemyArchetype, type TowerArchetype } from '../balance/archetypes';
import { META } from '../balance/economy';
import { BAR_Y, GAME_H, GAME_W, PLAY_Y, SCENES } from '../constants';
import { skin } from '../skins/registry';
import type { Tower } from '../game/Tower';
import { progression } from '../state';
import { sellValue } from '../systems/Economy';
import { addText, Button, COLORS, drawPanel } from '../ui/widgets';
import type { GameScene } from './GameScene';

type Obj = { destroy: () => void };

interface TowerButton {
  id: TowerArchetype;
  btn: Button;
  cost: Phaser.GameObjects.Text;
  lock: Phaser.GameObjects.Image;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** In-run HUD: top status bar, bottom tower bar, wave button, tower info panel. Runs above GameScene. */
export class HUDScene extends Phaser.Scene {
  private gs!: GameScene;
  private hpText!: Phaser.GameObjects.Text;
  private cashText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private metaText!: Phaser.GameObjects.Text;
  private towerButtons: TowerButton[] = [];
  private startBtn!: Button;
  private speedBtn!: Button;
  private muteBtn!: Button;
  private info: { objs: Obj[]; rect: Phaser.Geom.Rectangle; upgrade: Button; tower: Tower } | null = null;
  private tooltip: Obj[] = [];
  private preview: Obj[] = [];
  private previewKey = '';
  private cleanups: Array<() => void> = [];

  constructor() {
    super(SCENES.hud);
  }

  init(data: { gs: GameScene }): void {
    this.gs = data.gs;
    this.towerButtons = [];
    this.info = null;
    this.tooltip = [];
    this.preview = [];
    this.previewKey = '';
    this.cleanups = [];
  }

  create(): void {
    const g = this.add.graphics();
    drawPanel(g, 0, 0, GAME_W, PLAY_Y);
    drawPanel(g, 0, BAR_Y, GAME_W, GAME_H - BAR_Y);

    // Top bar
    this.add.image(8, 7, 'icon_heart');
    this.hpText = addText(this, 15, 3, '');
    this.add.image(52, 7, 'icon_credit');
    this.cashText = addText(this, 59, 3, '', { color: COLORS.gold });
    this.add.image(108, 7, 'icon_wave');
    this.waveText = addText(this, 115, 3, '');
    this.add.image(212, 7, 'icon_core');
    this.metaText = addText(this, 219, 3, '', { color: COLORS.cyan });
    addText(this, 380, 3, this.gs.map.name.toUpperCase(), { color: COLORS.faint, originX: 1 });

    this.speedBtn = new Button(this, GAME_W - 46, 1, 14, 12, { icon: 'icon_speed1', onClick: () => this.gs.setSpeed(this.gs.speed === 1 ? 2 : 1) });
    this.muteBtn = new Button(this, GAME_W - 31, 1, 14, 12, { icon: 'icon_sound_on', onClick: () => audio.toggleMute() });
    new Button(this, GAME_W - 16, 1, 14, 12, { icon: 'icon_pause', onClick: () => this.gs.pauseGame() });

    // Tower bar
    TOWER_ORDER.forEach((id, i) => {
      const def = skin().towers[id];
      const x = 4 + i * 32;
      const y = BAR_Y + 1;
      const btn = new Button(this, x, y, 30, 30, {
        icon: def.icon,
        iconOffsetY: -5,
        sfx: null,
        onClick: () => this.gs.togglePlacing(id),
        onHover: (over) => (over ? this.showTooltip(id, x) : this.hideTooltip()),
      });
      const cost = addText(this, x + 15, y + 20, `${def.levels[0].cost}`, { originX: 0.5 });
      const lock = this.add.image(x + 24, y + 6, 'icon_lock');
      this.towerButtons.push({ id, btn, cost, lock });
    });

    this.startBtn = new Button(this, GAME_W - 100, BAR_Y + 4, 96, 24, { label: 'SEND WAVE', sfx: null, onClick: () => this.gs.startWave() });

    // Wiring
    const onSelection = () => this.buildInfo();
    const onPlacing = (id: TowerArchetype | null) => this.towerButtons.forEach((b) => b.btn.setSelected(b.id === id));
    const onSpeed = (s: number) => this.speedBtn.setIcon(s === 1 ? 'icon_speed1' : 'icon_speed2');
    this.gs.events.on('selection', onSelection);
    this.gs.events.on('placing', onPlacing);
    this.gs.events.on('speed', onSpeed);
    this.cleanups.push(
      this.gs.run.events.on('change', () => this.refresh()),
      progression.events.on('change', () => this.refresh()),
      () => this.gs.events.off('selection', onSelection),
      () => this.gs.events.off('placing', onPlacing),
      () => this.gs.events.off('speed', onSpeed),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanups.forEach((f) => f()));

    this.refresh();
  }

  /** True if a screen point is covered by HUD chrome (so the game should ignore the click). */
  isOverUI(x: number, y: number): boolean {
    if (y < PLAY_Y || y >= BAR_Y) return true;
    return !!this.info?.rect.contains(x, y);
  }

  private refresh(): void {
    const run = this.gs.run;
    this.hpText.setText(`${run.hp}`).setColor(run.hp <= 5 ? COLORS.red : COLORS.text);
    this.cashText.setText(`${run.cash}`);
    this.waveText.setText(`WAVE ${Math.min(run.waveIndex + 1, run.totalWaves)}/${run.totalWaves}`);
    this.metaText.setText(`${progression.current.metaCurrency}`);
    this.muteBtn.setIcon(audio.muted ? 'icon_sound_off' : 'icon_sound_on');

    for (const b of this.towerButtons) {
      const unlocked = progression.isTowerUnlocked(b.id);
      const cost = skin().towers[b.id].levels[0].cost;
      b.btn.setEnabled(unlocked);
      b.lock.setVisible(!unlocked);
      b.cost.setText(unlocked ? `${cost}` : '---').setColor(!unlocked ? COLORS.faint : run.canAfford(cost) ? COLORS.gold : COLORS.red);
    }

    const building = run.phase === 'build';
    this.startBtn.setEnabled(building).setLabel(building ? 'SEND WAVE' : run.isOver ? '---' : 'INCOMING', building ? COLORS.green : COLORS.dim);

    const key = `${run.waveIndex}:${run.phase}`;
    if (key !== this.previewKey) {
      this.previewKey = key;
      this.buildPreview();
    }
    if (this.info) this.updateInfo();
  }

  /** Composition of the current (or next) wave, shown in the tower bar. */
  private buildPreview(): void {
    this.preview.forEach((o) => o.destroy());
    this.preview = [];
    const run = this.gs.run;
    if (run.isOver) return;
    const idx = Math.min(run.waveIndex, run.totalWaves - 1);
    const counts = new Map<EnemyArchetype, number>();
    for (const g of this.gs.map.waves[idx].groups) counts.set(g.enemy, (counts.get(g.enemy) ?? 0) + g.count);
    this.preview.push(addText(this, 236, BAR_Y + 4, run.phase === 'wave' ? 'NOW' : 'NEXT', { color: COLORS.faint }));
    let x = 236;
    for (const [id, n] of [...counts].slice(0, 4)) {
      const def = skin().enemies[id];
      const img = this.add.image(x + 6, BAR_Y + 21, def.sprite, firstFrame(this.textures, def.sprite));
      img.setScale(Math.min(1, 12 / Math.max(img.width, img.height)));
      const t = addText(this, x + 13, BAR_Y + 17, `${n}`, { color: def.boss ? COLORS.red : COLORS.text });
      this.preview.push(img, t);
      x += 16 + t.width + 4;
    }
  }

  private showTooltip(id: TowerArchetype, x: number): void {
    this.hideTooltip();
    const def = skin().towers[id];
    const unlocked = progression.isTowerUnlocked(id);
    const w = 168;
    const h = 44;
    const tx = Math.min(x, GAME_W - w - 4);
    const ty = BAR_Y - h - 2;
    const g = this.add.graphics();
    drawPanel(g, tx, ty, w, h);
    const hotkey = TOWER_ORDER.indexOf(id) + 1;
    const title = addText(this, tx + 4, ty + 4, `[${hotkey}] ${def.name}`, { color: COLORS.gold });
    const body = addText(this, tx + 4, ty + 15, def.blurb, { color: COLORS.dim, wrap: w - 8 });
    const foot = unlocked
      ? addText(this, tx + 4, ty + h - 11, `COST ${def.levels[0].cost}  RNG ${def.levels[0].range}`, { color: COLORS.text })
      : addText(this, tx + 4, ty + h - 11, `LOCKED - ${skin().strings.armoryLabel} ${META.towerUnlockCost[id]}`, { color: COLORS.red });
    this.tooltip = [g, title, body, foot];
  }

  private hideTooltip(): void {
    this.tooltip.forEach((o) => o.destroy());
    this.tooltip = [];
  }

  // ---------------------------------------------------------------- tower info panel

  private statLines(t: Tower): string[] {
    const s = t.stats;
    const n = t.nextStats && t.level < progression.maxLevel(t.def.id) ? t.nextStats : null;
    const up = (a: number, b: number | undefined, f = (v: number) => `${v}`) => (b !== undefined && b !== a ? `${f(a)}>${f(b)}` : f(a));
    if (t.def.attack === 'support') {
      return [
        `RATE +${up(s.buff!.fireRate, n?.buff?.fireRate, pct)}`,
        `DMG  +${up(s.buff!.damage, n?.buff?.damage, pct)}`,
        `RNG  ${up(s.range, n?.range)}`,
        'REVEALS HIDDEN',
      ];
    }
    const lines = [`DMG  ${up(s.damage, n?.damage)}`, `RNG  ${up(s.range, n?.range)}`, `RATE ${up(s.fireRate, n?.fireRate)}/s`];
    if (s.slow) lines.push(`SLOW ${up(s.slow.factor, n?.slow?.factor, pct)}`);
    else if (s.chain) lines.push(`CHAIN ${up(s.chain.targets, n?.chain?.targets)}`);
    else if (s.splashRadius && t.def.attack === 'mortar') lines.push(`SPLASH ${up(s.splashRadius, n?.splashRadius)}`);
    else if (t.def.attack === 'rail') lines.push(s.pierce ? 'PIERCING' : n?.pierce ? 'L3: PIERCE' : '');
    else if (t.def.damageType === 'emp') lines.push(`x3 VS ${skin().strings.shieldNoun}`);
    if (t.buff.fireRate > 0) lines.push(`BOOSTED +${pct(t.buff.fireRate)}`);
    return lines.filter(Boolean);
  }

  private buildInfo(): void {
    this.info?.objs.forEach((o) => o.destroy());
    this.info = null;
    const t = this.gs.selected;
    if (!t) return;

    const w = 138;
    const h = 112;
    const x = t.x < GAME_W / 2 ? GAME_W - w - 4 : 4;
    const y = PLAY_Y + 4;
    const objs: Obj[] = [];
    const g = this.add.graphics();
    drawPanel(g, x, y, w, h);
    objs.push(g);
    objs.push(addText(this, x + 4, y + 4, t.def.name, { color: COLORS.gold }));
    objs.push(addText(this, x + w - 4, y + 16, `LV${t.level}`, { color: t.level === 3 ? COLORS.gold : COLORS.cyan, originX: 1 }));
    this.statLines(t).forEach((line, i) => objs.push(addText(this, x + 4, y + 16 + i * 10, line, { color: line.includes('>') ? COLORS.green : COLORS.text })));

    const hasTargeting = t.def.attack !== 'support' && t.def.attack !== 'pulse';
    if (hasTargeting) {
      objs.push(new Button(this, x + 4, y + 66, w - 8, 12, { label: `TARGET ${t.targetMode.toUpperCase()}`, onClick: () => this.gs.cycleTargetMode() }));
    }
    const upgrade = new Button(this, x + 4, y + 80, 64, 14, { label: '', sfx: null, onClick: () => this.gs.upgradeSelected() });
    objs.push(upgrade);
    objs.push(new Button(this, x + 70, y + 80, 64, 14, { label: `SELL ${sellValue(t.invested)}`, sfx: null, onClick: () => this.gs.sellSelected() }));
    objs.push(addText(this, x + 4, y + 99, `KILLS ${t.kills}`, { color: COLORS.faint }));

    this.info = { objs, rect: new Phaser.Geom.Rectangle(x, y, w, h), upgrade, tower: t };
    this.updateInfo();
  }

  private updateInfo(): void {
    if (!this.info) return;
    const status = this.gs.upgradeStatus(this.info.tower);
    const btn = this.info.upgrade;
    if (status.kind === 'max') btn.setEnabled(false).setLabel('MAX', COLORS.gold);
    else if (status.kind === 'locked') btn.setEnabled(false).setLabel('L3 LOCK', COLORS.faint);
    else btn.setEnabled(this.gs.run.canAfford(status.cost)).setLabel(`UP ${status.cost}`, COLORS.green);
  }
}
