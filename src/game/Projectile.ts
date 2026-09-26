import type * as Phaser from 'phaser';
import { firstFrame } from '../assets/SpriteFactory';
import type { DamageType } from '../balance/types';
import { DEPTH } from '../constants';
import { TEX } from '../skins/keys';
import type { Enemy } from './Enemy';
import type { Tower } from './Tower';

interface Payload {
  damage: number;
  splash: number;
  type: DamageType;
  source: Tower;
}

/** Lobbed mortar shell: flies in an arc to a fixed landing point, then explodes. */
export class Shell {
  private t = 0;
  readonly sprite: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    private readonly sx: number,
    private readonly sy: number,
    readonly tx: number,
    readonly ty: number,
    private readonly flight: number,
    readonly payload: Payload,
  ) {
    this.sprite = scene.add.image(sx, sy, TEX.projSplash).setDepth(DEPTH.projectile);
  }

  /** Returns true when the shell lands. */
  update(dt: number): boolean {
    this.t = Math.min(1, this.t + dt / this.flight);
    const arc = Math.sin(Math.PI * this.t);
    this.sprite.setPosition(
      Math.round(this.sx + (this.tx - this.sx) * this.t),
      Math.round(this.sy + (this.ty - this.sy) * this.t - arc * 22),
    );
    this.sprite.setScale(1 + arc * 0.6);
    return this.t >= 1;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

/** Homing orb (EMP): tracks its target; if the target dies it continues to the last known position. */
export class Orb {
  x: number;
  y: number;
  private lastX: number;
  private lastY: number;
  readonly sprite: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly target: Enemy,
    private readonly speed: number,
    readonly payload: Payload,
  ) {
    this.x = x;
    this.y = y;
    this.lastX = target.x;
    this.lastY = target.y;
    this.sprite = scene.add
      .sprite(x, y, TEX.projAntishield, firstFrame(scene.textures, TEX.projAntishield))
      .setDepth(DEPTH.projectile);
    if (scene.anims.exists(`${TEX.projAntishield}_anim`)) this.sprite.play(`${TEX.projAntishield}_anim`);
  }

  /** Returns true on impact. */
  update(dt: number): boolean {
    if (this.target.alive) {
      this.lastX = this.target.x;
      this.lastY = this.target.y;
    }
    const dx = this.lastX - this.x;
    const dy = this.lastY - this.y;
    const d = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (d <= step + 2) {
      this.x = this.lastX;
      this.y = this.lastY;
      return true;
    }
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));
    return false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
