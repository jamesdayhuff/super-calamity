import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import { drawTextureFrame, firstFrame } from '../assets/SpriteFactory';
import { TOWER_ORDER, type TowerArchetype } from '../balance/archetypes';
import type { MapDef, TargetMode, ThemeDef } from '../balance/types';
import { COLS, DEPTH, FONT, PLAY_H, PLAY_Y, ROWS, SCENES, TILE } from '../constants';
import { skin } from '../skins/registry';
import { TEX } from '../skins/keys';
import type { ResolvedSkin } from '../skins/types';
import { COLORS, numColor } from '../ui/widgets';
import { Effects } from '../game/Effects';
import type { Enemy } from '../game/Enemy';
import type { Tower } from '../game/Tower';
import { World, type UpgradeStatus } from '../game/World';
import { progression } from '../state';
import type { RunState } from '../state/RunState';
import type { MetaPayout } from '../systems/Economy';
import { cellHash } from '../util/rng';
import type { HUDScene } from './HUDScene';

export interface GameInitData {
  mapIndex: number;
}

export interface RunStats {
  wavesCleared: number;
  totalWaves: number;
  kills: number;
  cashEarned: number;
  leaks: number;
}

export interface ResultData {
  mapIndex: number;
  victory: boolean;
  payout: MetaPayout;
  stats: RunStats;
  nextUnlocked: boolean;
}

const TARGET_MODES: TargetMode[] = ['first', 'last', 'strong'];

/** Rendering, input and scene flow for a run. The rules themselves live in World. */
export class GameScene extends Phaser.Scene {
  mapIndex = 0;
  map!: MapDef;
  theme!: ThemeDef;
  content!: ResolvedSkin;
  world!: World;
  effects!: Effects;
  speed = 1;
  placing: TowerArchetype | null = null;
  selected: Tower | null = null;

  private bars!: Phaser.GameObjects.Graphics;
  private overlay!: Phaser.GameObjects.Graphics;
  private ghostBase!: Phaser.GameObjects.Image;
  private ghostHead!: Phaser.GameObjects.Image;
  private base!: Phaser.GameObjects.Sprite;
  private hover: { col: number; row: number } | null = null;
  private finished = false;

  constructor() {
    super(SCENES.game);
  }

  get run(): RunState {
    return this.world.run;
  }

  init(data: GameInitData): void {
    this.mapIndex = data.mapIndex ?? 0;
    this.speed = 1;
    this.placing = null;
    this.selected = null;
    this.hover = null;
    this.finished = false;
  }

  create(): void {
    this.content = skin();
    this.map = this.content.maps[this.mapIndex];
    this.theme = this.content.themes[this.map.theme];
    this.tweens.timeScale = 1;
    this.time.timeScale = 1;

    this.effects = new Effects(this);
    this.world = new World(
      this,
      this.map,
      this.content,
      this.effects,
      {
        onLeak: (e) => this.onLeak(e),
        onBossKilled: () => this.cameras.main.shake(300, 0.01),
        onWaveStart: (i, hasBoss) => {
          audio.play('wave_start', 0);
          if (hasBoss) this.banner('!! BOSS INCOMING !!', COLORS.red, `WAVE ${i + 1}`);
        },
        onWaveCleared: (n, bonus) => {
          audio.play('wave_clear', 0);
          this.banner(`WAVE ${n} CLEARED  +${bonus}`, COLORS.green);
        },
        onFinish: (victory) => this.onFinish(victory),
      },
      (id) => progression.maxLevel(id),
    );

    this.cameras.main.setBackgroundColor(this.theme.background);
    this.renderBackground();

    const [bc, br] = this.world.grid.base;
    this.base = this.add.sprite(bc * TILE + TILE / 2, PLAY_Y + br * TILE + TILE / 2, TEX.base, firstFrame(this.textures, TEX.base));
    this.base.setDepth(DEPTH.base);
    if (this.anims.exists(`${TEX.base}_anim`)) this.base.play(`${TEX.base}_anim`);

    this.bars = this.add.graphics().setDepth(DEPTH.bars);
    this.overlay = this.add.graphics().setDepth(DEPTH.rangePreview);
    const firstTower = this.content.towers[TOWER_ORDER[0]];
    this.ghostBase = this.add.image(0, 0, firstTower.sprites.base[0]).setDepth(DEPTH.ghost).setAlpha(0.7).setVisible(false);
    this.ghostHead = this.add.image(0, 0, firstTower.sprites.head[0]).setDepth(DEPTH.ghost).setAlpha(0.7).setVisible(false);

    this.setupInput();
    this.scene.launch(SCENES.hud, { gs: this });
    audio.playMusic(this.map.music);
    this.banner(this.map.name.toUpperCase(), COLORS.gold, `${this.content.strings.levelNoun} ${this.mapIndex + 1}`);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.world.destroy();
      this.scene.stop(SCENES.hud);
    });
  }

  // ---------------------------------------------------------------- rendering

  private renderBackground(): void {
    const key = `map_bg_${this.map.id}`;
    if (this.textures.exists(key)) this.textures.remove(key);
    const canvas = document.createElement('canvas');
    canvas.width = COLS * TILE;
    canvas.height = ROWS * TILE;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const tm = this.textures;
    const grid = this.world.grid;
    const { floorTiles, floorWeights, pathTile, decor, pathEdge } = this.theme;

    const pickFloor = (c: number, r: number) => {
      let roll = cellHash(c, r, this.map.seed);
      for (let i = 0; i < floorTiles.length; i++) {
        if (roll < floorWeights[i] || i === floorTiles.length - 1) return floorTiles[i];
        roll -= floorWeights[i];
      }
      return floorTiles[0];
    };

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const kind = grid.cells[r][c];
        const x = c * TILE;
        const y = r * TILE;
        if (kind === 'path') {
          drawTextureFrame(ctx, tm, pathTile, x, y);
          continue;
        }
        drawTextureFrame(ctx, tm, pickFloor(c, r), x, y);
        if (kind === 'decor') {
          drawTextureFrame(ctx, tm, decor[Math.floor(cellHash(c, r, this.map.seed + 7) * decor.length)], x, y);
        }
      }
    }

    // 1px edge where the path meets floor.
    ctx.fillStyle = pathEdge;
    const isPath = (c: number, r: number) => c < 0 || r < 0 || c >= COLS || r >= ROWS || grid.cells[r][c] === 'path';
    for (const [c, r] of grid.pathTiles) {
      const x = c * TILE;
      const y = r * TILE;
      if (!isPath(c, r - 1)) ctx.fillRect(x, y, TILE, 1);
      if (!isPath(c, r + 1)) ctx.fillRect(x, y + TILE - 1, TILE, 1);
      if (!isPath(c - 1, r)) ctx.fillRect(x, y, 1, TILE);
      if (!isPath(c + 1, r)) ctx.fillRect(x + TILE - 1, y, 1, TILE);
    }

    this.textures.addCanvas(key, canvas);
    this.add.image(0, PLAY_Y, key).setOrigin(0).setDepth(DEPTH.background);

    // Spawn marker on the first in-grid path tile.
    const [sc, sr] = grid.pathTiles[0];
    const marker = this.add
      .text(sc * TILE + TILE / 2, PLAY_Y + sr * TILE + TILE / 2, '!', { fontFamily: FONT, fontSize: '8px', color: COLORS.red })
      .setOrigin(0.5)
      .setDepth(DEPTH.decor);
    this.tweens.add({ targets: marker, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
  }

  banner(title: string, color = COLORS.text, subtitle?: string): void {
    const cy = PLAY_Y + PLAY_H / 2;
    const cx = (COLS * TILE) / 2;
    const objs: Phaser.GameObjects.GameObject[] = [];
    objs.push(this.add.rectangle(0, cy - 14, COLS * TILE, subtitle ? 30 : 20, COLORS.scrim, 0.7).setOrigin(0).setDepth(DEPTH.ghost + 1));
    if (subtitle) {
      objs.push(this.add.text(cx, cy - 10, subtitle, { fontFamily: FONT, fontSize: '8px', color: COLORS.dim }).setOrigin(0.5, 0).setDepth(DEPTH.ghost + 2));
    }
    objs.push(
      this.add
        .text(cx, subtitle ? cy + 1 : cy - 8, title, { fontFamily: FONT, fontSize: '8px', color })
        .setOrigin(0.5, 0)
        .setDepth(DEPTH.ghost + 2),
    );
    this.tweens.add({ targets: objs, alpha: 0, delay: 1300, duration: 400, onComplete: () => objs.forEach((o) => o.destroy()) });
  }

  update(_time: number, delta: number): void {
    const dt = (Math.min(delta, 50) / 1000) * this.speed;
    this.effects.update(dt);
    this.world.update(dt);
    this.drawBars();
    this.drawOverlay();
  }

  private drawBars(): void {
    const g = this.bars;
    g.clear();
    for (const e of this.world.enemies) {
      if (!e.alive) continue;
      const alpha = e.cloaked && e.revealTimer <= 0 ? 0.2 : 1;
      if (e.maxShield > 0 && e.shield > 0) {
        g.lineStyle(1, numColor(COLORS.cyan), (0.25 + (0.55 * e.shield) / e.maxShield) * alpha);
        g.strokeCircle(e.x, e.y, e.def.radius + 3);
      }
      const showHp = e.hp < e.maxHp || !!e.def.boss;
      const showShield = e.maxShield > 0;
      if (!showHp && !showShield) continue;
      const w = e.def.boss ? 22 : 10;
      const x = Math.round(e.x - w / 2);
      const y = Math.round(e.y - e.def.radius - 6);
      if (showShield) {
        g.fillStyle(COLORS.panel, alpha).fillRect(x, y - 2, w, 1);
        g.fillStyle(numColor(COLORS.cyan), alpha).fillRect(x, y - 2, Math.ceil((w * e.shield) / e.maxShield), 1);
      }
      const ratio = e.hp / e.maxHp;
      g.fillStyle(COLORS.panel, alpha).fillRect(x, y, w, 2);
      g.fillStyle(numColor(ratio > 0.5 ? COLORS.green : ratio > 0.25 ? COLORS.gold : COLORS.red), alpha).fillRect(x, y, Math.ceil(w * ratio), 2);
    }
  }

  private drawOverlay(): void {
    const g = this.overlay;
    g.clear();
    if (this.placing) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (this.world.canBuild(c, r)) g.fillStyle(numColor(COLORS.text), 0.05).fillRect(c * TILE + 1, PLAY_Y + r * TILE + 1, TILE - 2, TILE - 2);
        }
      }
      if (this.hover) {
        const { col, row } = this.hover;
        const level1 = this.content.towers[this.placing].levels[0];
        const ok = this.world.canBuild(col, row) && this.run.canAfford(level1.cost);
        const color = numColor(ok ? COLORS.green : COLORS.red);
        const cx = col * TILE + TILE / 2;
        const cy = PLAY_Y + row * TILE + TILE / 2;
        g.lineStyle(1, color, 0.9).strokeRect(col * TILE + 0.5, PLAY_Y + row * TILE + 0.5, TILE - 1, TILE - 1);
        g.fillStyle(color, 0.08).fillCircle(cx, cy, level1.range);
        g.lineStyle(1, color, 0.5).strokeCircle(cx, cy, level1.range);
      }
    }
    const t = this.selected;
    if (t) {
      g.fillStyle(t.def.color, 0.08).fillCircle(t.x, t.y, t.stats.range);
      g.lineStyle(1, t.def.color, 0.7).strokeCircle(t.x, t.y, t.stats.range);
      g.lineStyle(1, COLORS.borderHi, 1).strokeRect(t.x - TILE / 2 + 0.5, t.y - TILE / 2 + 0.5, TILE - 1, TILE - 1);
    }
  }

  // ---------------------------------------------------------------- world feedback

  private onLeak(e: Enemy): void {
    this.cameras.main.shake(150, 0.006);
    this.base.setTintFill(numColor(COLORS.red));
    this.time.delayedCall(90, () => this.base.clearTint());
    this.effects.floatText(this.base.x, this.base.y - 14, `-${e.def.baseDamage}`, COLORS.red);
  }

  private onFinish(victory: boolean): void {
    this.finished = true;
    this.cancelPlacing();
    this.selectTower(null);
    this.setSpeed(1);
    const wasCompleted = progression.isMapCompleted(this.map.id);
    const payout = progression.recordRun(this.map, this.run.wavesCleared, victory);
    audio.stopMusic();
    audio.play(victory ? 'victory' : 'defeat', 0);
    if (!victory) {
      this.effects.explosion(this.base.x, this.base.y, 2.5);
      this.base.setTint(COLORS.panelDeep);
      this.cameras.main.shake(400, 0.012);
    }
    const st = this.content.strings;
    this.banner(victory ? st.winBanner : st.loseBanner, victory ? COLORS.green : COLORS.red);

    const data: ResultData = {
      mapIndex: this.mapIndex,
      victory,
      payout,
      stats: {
        wavesCleared: this.run.wavesCleared,
        totalWaves: this.run.totalWaves,
        kills: this.run.kills,
        cashEarned: this.run.cashEarned,
        leaks: this.run.leaks,
      },
      nextUnlocked: victory && !wasCompleted && this.mapIndex + 1 < this.content.maps.length,
    };
    this.time.delayedCall(1800, () => this.scene.start(SCENES.result, data));
  }

  /** Leave mid-run (from pause). Waves already cleared still pay out meta-currency. */
  abandon(then: 'menu' | 'retry'): void {
    if (!this.world.ended) {
      this.world.ended = true;
      progression.recordRun(this.map, this.run.wavesCleared, false);
    }
    audio.stopMusic();
    if (then === 'retry') this.scene.start(SCENES.game, { mapIndex: this.mapIndex });
    else this.scene.start(SCENES.mapSelect);
  }

  // ---------------------------------------------------------------- player actions (HUD + keys)

  startWave(): void {
    this.world.startWave();
  }

  upgradeStatus(t: Tower): UpgradeStatus {
    return this.world.upgradeStatus(t);
  }

  togglePlacing(id: TowerArchetype): void {
    if (this.finished) return;
    if (!progression.isTowerUnlocked(id)) {
      audio.play('error', 0);
      return;
    }
    if (this.placing === id) {
      this.cancelPlacing();
      return;
    }
    this.selectTower(null);
    this.placing = id;
    this.ghostBase.setTexture(this.content.towers[id].sprites.base[0]);
    this.ghostHead.setTexture(this.content.towers[id].sprites.head[0]);
    this.updateGhost();
    this.events.emit('placing', id);
  }

  cancelPlacing(): void {
    if (!this.placing) return;
    this.placing = null;
    this.ghostBase.setVisible(false);
    this.ghostHead.setVisible(false);
    this.events.emit('placing', null);
  }

  private tryPlace(col: number, row: number, keepPlacing: boolean): void {
    const id = this.placing;
    if (!id) return;
    const t = this.world.buildTower(id, col, row);
    if (!t) {
      audio.play('error', 0);
      return;
    }
    audio.play('place', 0);
    this.effects.ring(t.x, t.y, 4, 14, t.def.color, 0.3);
    if (!keepPlacing || !this.run.canAfford(t.def.levels[0].cost)) this.cancelPlacing();
  }

  selectTower(t: Tower | null): void {
    this.selected = t;
    this.events.emit('selection', t);
  }

  upgradeSelected(): void {
    const t = this.selected;
    if (!t) return;
    if (!this.world.upgradeTower(t)) {
      audio.play('error', 0);
      return;
    }
    audio.play('upgrade', 0);
    this.effects.ring(t.x, t.y, 4, 18, COLORS.borderHi, 0.35);
    this.events.emit('selection', t);
  }

  sellSelected(): void {
    const t = this.selected;
    if (!t) return;
    const refund = this.world.sellTower(t);
    audio.play('sell', 0);
    this.effects.floatText(t.x, t.y - 8, `+${refund}`, COLORS.gold);
    this.selectTower(null);
  }

  cycleTargetMode(): void {
    const t = this.selected;
    if (!t) return;
    t.targetMode = TARGET_MODES[(TARGET_MODES.indexOf(t.targetMode) + 1) % TARGET_MODES.length];
    this.events.emit('selection', t);
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    this.tweens.timeScale = speed;
    this.time.timeScale = speed;
    this.events.emit('speed', speed);
  }

  pauseGame(): void {
    if (this.finished) return;
    this.scene.launch(SCENES.pause);
    this.scene.pause(SCENES.hud);
    this.scene.pause();
  }

  // ---------------------------------------------------------------- input

  private get hud(): HUDScene | null {
    return this.scene.isActive(SCENES.hud) ? (this.scene.get(SCENES.hud) as HUDScene) : null;
  }

  private cellAt(x: number, y: number): { col: number; row: number } | null {
    const col = Math.floor(x / TILE);
    const row = Math.floor((y - PLAY_Y) / TILE);
    return col >= 0 && row >= 0 && col < COLS && row < ROWS ? { col, row } : null;
  }

  private updateGhost(): void {
    const show = !!this.placing && !!this.hover;
    this.ghostBase.setVisible(show);
    this.ghostHead.setVisible(show);
    if (!show || !this.hover) return;
    const x = this.hover.col * TILE + TILE / 2;
    const y = PLAY_Y + this.hover.row * TILE + TILE / 2;
    this.ghostBase.setPosition(x, y);
    this.ghostHead.setPosition(x, y);
  }

  private setupInput(): void {
    this.input.mouse?.disableContextMenu();

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
      this.hover = this.hud?.isOverUI(p.x, p.y) ? null : this.cellAt(p.x, p.y);
      this.updateGhost();
    });

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (this.finished) return;
      if ((p.event as MouseEvent).button === 2) {
        if (this.placing) this.cancelPlacing();
        else this.selectTower(null);
        return;
      }
      if (this.hud?.isOverUI(p.x, p.y)) return;
      const cell = this.cellAt(p.x, p.y);
      if (!cell) return;
      if (this.placing) {
        this.tryPlace(cell.col, cell.row, (p.event as MouseEvent).shiftKey);
        return;
      }
      const t = this.world.towerAt(cell.col, cell.row);
      if (t) audio.play('click', 0);
      this.selectTower(t && t !== this.selected ? t : null);
    });

    const kb = this.input.keyboard;
    if (!kb) return;
    kb.addCapture('SPACE');
    kb.on('keydown', (e: KeyboardEvent) => this.onKey(e));
  }

  private onKey(e: KeyboardEvent): void {
    if (this.finished) return;
    const k = e.code === 'Space' ? ' ' : e.key.toLowerCase();
    const n = Number(k);
    if (n >= 1 && n <= TOWER_ORDER.length) {
      this.togglePlacing(TOWER_ORDER[n - 1]);
      return;
    }
    switch (k) {
      case 'escape':
        if (this.placing) this.cancelPlacing();
        else if (this.selected) this.selectTower(null);
        else this.pauseGame();
        return;
      case ' ':
        this.startWave();
        return;
      case 'u':
        this.upgradeSelected();
        return;
      case 's':
        this.sellSelected();
        return;
      case 't':
        this.cycleTargetMode();
        return;
      case 'f':
        this.setSpeed(this.speed === 1 ? 2 : 1);
        return;
      case 'p':
        this.pauseGame();
        return;
      case 'm':
        audio.toggleMute();
        return;
    }
    if (import.meta.env.DEV) this.debugKey(k);
  }

  /** Dev-only cheats: C = +500 cash, K = kill all, N = clear current wave instantly, L = unlock everything. */
  private debugKey(k: string): void {
    switch (k) {
      case 'c':
        this.run.earn(500);
        break;
      case 'k':
        for (const e of [...this.world.enemies]) if (e.alive) this.world.damageEnemy(e, 1e9, 'kinetic');
        break;
      case 'n':
        this.world.debugClearWave();
        break;
      case 'l':
        progression.unlockEverything();
        progression.addMeta(500);
        break;
    }
  }
}
