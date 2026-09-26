import type * as Phaser from 'phaser';
import { firstFrame } from '../assets/SpriteFactory';
import type { TargetMode, TowerDef, TowerLevel } from '../balance/types';
import { DEPTH, PLAY_Y, TILE } from '../constants';
import { TEX } from '../skins/keys';

export class Tower {
  level = 1;
  cooldown = 0;
  targetMode: TargetMode = 'first';
  /** Current support buff from nearby Drone Bays (recomputed every frame). */
  readonly buff = { fireRate: 0, damage: 0 };
  invested: number;
  damageDealt = 0;
  kills = 0;
  readonly x: number;
  readonly y: number;
  readonly base: Phaser.GameObjects.Image;
  readonly head: Phaser.GameObjects.Image;
  private drones: Phaser.GameObjects.Sprite[] = [];
  private droneAngle = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly def: TowerDef,
    readonly col: number,
    readonly row: number,
  ) {
    this.x = col * TILE + TILE / 2;
    this.y = PLAY_Y + row * TILE + TILE / 2;
    this.base = scene.add.image(this.x, this.y, def.sprites.base[0]).setDepth(DEPTH.tower);
    this.head = scene.add.image(this.x, this.y, def.sprites.head[0]).setDepth(DEPTH.tower + 0.1);
    this.invested = def.levels[0].cost;
    this.syncDrones();
  }

  get stats(): TowerLevel {
    return this.def.levels[this.level - 1];
  }

  get nextStats(): TowerLevel | null {
    return this.def.levels[this.level] ?? null;
  }

  get rotates(): boolean {
    return this.def.attack === 'beam' || this.def.attack === 'rail';
  }

  muzzle(): { x: number; y: number } {
    const r = this.rotates ? 7 : 0;
    return { x: this.x + Math.cos(this.head.rotation) * r, y: this.y + Math.sin(this.head.rotation) * r };
  }

  aimAt(x: number, y: number): void {
    if (this.rotates) this.head.setRotation(Math.atan2(y - this.y, x - this.x));
  }

  upgrade(): void {
    this.level++;
    this.invested += this.def.levels[this.level - 1].cost;
    this.base.setTexture(this.def.sprites.base[this.level - 1]);
    this.head.setTexture(this.def.sprites.head[this.level - 1]);
    this.syncDrones();
    this.scene.tweens.add({ targets: [this.base, this.head], scale: { from: 1.35, to: 1 }, duration: 220 });
  }

  update(dt: number): void {
    if (!this.drones.length) return;
    this.droneAngle += dt * 2.2;
    this.drones.forEach((d, i) => {
      const a = this.droneAngle + (i * Math.PI * 2) / this.drones.length;
      d.setPosition(Math.round(this.x + Math.cos(a) * 10), Math.round(this.y + Math.sin(a) * 7));
    });
  }

  private syncDrones(): void {
    if (this.def.attack !== 'support') return;
    this.drones.forEach((d) => d.destroy());
    this.drones = [];
    for (let i = 0; i < this.level + 1; i++) {
      const d = this.scene.add.sprite(this.x, this.y, TEX.orbiter, firstFrame(this.scene.textures, TEX.orbiter));
      d.setDepth(DEPTH.tower + 0.2);
      if (this.scene.anims.exists(`${TEX.orbiter}_anim`)) d.play(`${TEX.orbiter}_anim`);
      this.drones.push(d);
    }
  }

  destroy(): void {
    this.base.destroy();
    this.head.destroy();
    this.drones.forEach((d) => d.destroy());
  }
}
