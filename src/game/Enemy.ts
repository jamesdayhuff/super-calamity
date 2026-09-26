import type * as Phaser from 'phaser';
import { firstFrame } from '../assets/SpriteFactory';
import { COMBAT } from '../balance/combat';
import type { AbilityDef, DamageType, EnemyDef } from '../balance/types';
import { DEPTH } from '../constants';
import { applyDamage, type DamageResult } from '../systems/DamageModel';
import type { Path } from '../systems/Path';

type Ability<T extends AbilityDef['type']> = Extract<AbilityDef, { type: T }>;
export type EnemyEvent = 'heal' | 'cloak' | 'uncloak';

let nextId = 1;

export class Enemy {
  readonly id = nextId++;
  readonly maxHp: number;
  readonly maxShield: number;
  hp: number;
  shield: number;
  distance: number;
  x = 0;
  y = 0;
  alive = true;
  reached = false;
  cloaked = false;
  /** > 0 while inside a sensor field: cloaked enemies become targetable. */
  revealTimer = 0;
  readonly sprite: Phaser.GameObjects.Sprite;
  private slowFactor = 0;
  private slowTimer = 0;
  private shieldIdle = 0;
  private cloakTimer = 0;
  private healTimer = 0;
  private flashTimer = 0;
  private readonly events: EnemyEvent[] = [];

  constructor(
    scene: Phaser.Scene,
    readonly def: EnemyDef,
    readonly hpMult: number,
    distance: number,
    private readonly path: Path,
  ) {
    this.maxHp = Math.round(def.hp * hpMult);
    this.hp = this.maxHp;
    this.maxShield = Math.round((def.shield?.max ?? 0) * hpMult);
    this.shield = this.maxShield;
    this.distance = distance;
    this.cloakTimer = this.ability('cloak')?.visible ?? 0;
    this.healTimer = this.ability('heal')?.interval ?? 0;

    this.sprite = scene.add.sprite(0, 0, def.sprite, firstFrame(scene.textures, def.sprite));
    this.sprite.setDepth(def.boss ? DEPTH.enemy + 0.5 : DEPTH.enemy);
    const anim = `${def.sprite}_anim`;
    if (scene.anims.exists(anim)) this.sprite.play({ key: anim, startFrame: this.id % 2 });
    this.move(0);
    this.render();
  }

  ability<T extends AbilityDef['type']>(type: T): Ability<T> | undefined {
    return this.def.abilities?.find((a): a is Ability<T> => a.type === type);
  }

  get targetable(): boolean {
    return this.alive && (!this.cloaked || this.revealTimer > 0);
  }

  get currentSpeed(): number {
    return this.def.speed * (1 - this.slowFactor);
  }

  applySlow(factor: number, duration: number): void {
    const eff = Math.min(1 - COMBAT.minSpeedFactor, factor * (1 - (this.def.slowResist ?? 0)));
    if (eff >= this.slowFactor) {
      this.slowFactor = eff;
      this.slowTimer = Math.max(this.slowTimer, duration);
    }
  }

  takeDamage(amount: number, type: DamageType): DamageResult {
    const r = applyDamage(this, amount, type);
    // Any hit (shield or hull) delays shield regeneration: the shield only recovers once the enemy is left alone.
    if (r.shieldDamage > 0 || r.hullDamage > 0) this.shieldIdle = 0;
    this.flashTimer = 0.06;
    return r;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /** Advance one tick. Returns ability events the scene should react to (reused array). */
  update(dt: number): readonly EnemyEvent[] {
    this.events.length = 0;
    this.move(dt);

    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowFactor = 0;
    }

    const sd = this.def.shield;
    if (sd && this.shield < this.maxShield) {
      this.shieldIdle += dt;
      if (this.shieldIdle >= sd.regenDelay) {
        this.shield = Math.min(this.maxShield, this.shield + sd.regenRate * this.hpMult * dt);
      }
    }

    const cloak = this.ability('cloak');
    if (cloak) {
      this.cloakTimer -= dt;
      if (this.cloakTimer <= 0) {
        this.cloaked = !this.cloaked;
        this.cloakTimer = this.cloaked ? cloak.cloaked : cloak.visible;
        this.events.push(this.cloaked ? 'cloak' : 'uncloak');
      }
    }
    if (this.revealTimer > 0) this.revealTimer -= dt;

    const heal = this.ability('heal');
    if (heal) {
      this.healTimer -= dt;
      if (this.healTimer <= 0) {
        this.healTimer = heal.interval;
        this.events.push('heal');
      }
    }

    if (this.flashTimer > 0) this.flashTimer -= dt;
    this.render();
    return this.events;
  }

  private move(dt: number): void {
    this.distance += this.currentSpeed * dt;
    if (this.distance >= this.path.length) this.reached = true;
    const pose = this.path.pointAt(this.distance);
    this.x = pose.x;
    this.y = pose.y;
    const cos = Math.cos(pose.angle);
    if (cos < -0.1) this.sprite.setFlipX(true);
    else if (cos > 0.1) this.sprite.setFlipX(false);
  }

  private render(): void {
    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));
    this.sprite.setAlpha(this.cloaked ? (this.revealTimer > 0 ? 0.55 : 0.15) : 1);
    if (this.flashTimer > 0) this.sprite.setTintFill(0xffffff);
    else if (this.slowFactor > 0) this.sprite.setTint(0x9fdcff);
    else this.sprite.clearTint();
  }

  destroy(): void {
    this.alive = false;
    this.sprite.destroy();
  }
}
