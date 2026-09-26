import * as Phaser from 'phaser';
import { firstFrame } from '../assets/SpriteFactory';
import { DEPTH, FONT } from '../constants';
import { TEX } from '../skins/keys';
import type { Point } from '../systems/Path';

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: number;
  width: number;
  life: number;
  max: number;
}

interface Ring {
  x: number;
  y: number;
  r0: number;
  r1: number;
  color: number;
  life: number;
  max: number;
}

interface Bolt {
  pts: Point[];
  color: number;
  life: number;
  max: number;
}

/** Transient combat visuals. Vector effects share one Graphics redrawn each frame; sprite effects use tweens. */
export class Effects {
  private readonly g: Phaser.GameObjects.Graphics;
  private lines: Line[] = [];
  private rings: Ring[] = [];
  private bolts: Bolt[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    this.g = scene.add.graphics().setDepth(DEPTH.effects);
  }

  beam(x1: number, y1: number, x2: number, y2: number, color: number, width = 1, life = 0.07): void {
    this.lines.push({ x1, y1, x2, y2, color, width, life, max: life });
  }

  ring(x: number, y: number, r0: number, r1: number, color: number, life = 0.3): void {
    this.rings.push({ x, y, r0, r1, color, life, max: life });
  }

  /** Jagged lightning through a list of points. */
  bolt(points: Point[], color: number, life = 0.14): void {
    const pts: Point[] = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const nx = -(b.y - a.y);
      const ny = b.x - a.x;
      const len = Math.hypot(nx, ny) || 1;
      for (let s = 1; s < 4; s++) {
        const off = (Math.random() - 0.5) * 6;
        pts.push({ x: a.x + ((b.x - a.x) * s) / 4 + (nx / len) * off, y: a.y + ((b.y - a.y) * s) / 4 + (ny / len) * off });
      }
      pts.push(b);
    }
    this.bolts.push({ pts, color, life, max: life });
  }

  explosion(x: number, y: number, scale = 1): void {
    const s = this.scene.add.sprite(x, y, TEX.explosion, firstFrame(this.scene.textures, TEX.explosion));
    s.setDepth(DEPTH.effects).setScale(scale);
    if (this.scene.anims.exists(`${TEX.explosion}_anim`)) {
      s.play(`${TEX.explosion}_anim`);
      s.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => s.destroy());
    } else {
      this.scene.tweens.add({ targets: s, alpha: 0, duration: 250, onComplete: () => s.destroy() });
    }
  }

  sparks(x: number, y: number, count = 4, tint?: number): void {
    for (let i = 0; i < count; i++) {
      const img = this.scene.add.image(x, y, TEX.spark).setDepth(DEPTH.effects);
      if (tint !== undefined) img.setTint(tint);
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 8;
      this.scene.tweens.add({
        targets: img,
        x: x + Math.cos(a) * r,
        y: y + Math.sin(a) * r,
        alpha: 0,
        duration: 220 + Math.random() * 180,
        onComplete: () => img.destroy(),
      });
    }
  }

  floatIcon(x: number, y: number, key: string): void {
    const img = this.scene.add.image(x, y, key).setDepth(DEPTH.effects);
    this.scene.tweens.add({ targets: img, y: y - 10, alpha: 0, duration: 600, onComplete: () => img.destroy() });
  }

  floatText(x: number, y: number, str: string, color: string): void {
    const t = this.scene.add
      .text(Math.round(x), Math.round(y), str, { fontFamily: FONT, fontSize: '8px', color })
      .setOrigin(0.5)
      .setDepth(DEPTH.effects + 1);
    this.scene.tweens.add({ targets: t, y: y - 12, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  update(dt: number): void {
    const tick = <T extends { life: number }>(list: T[]) => list.filter((e) => (e.life -= dt) > 0);
    this.lines = tick(this.lines);
    this.rings = tick(this.rings);
    this.bolts = tick(this.bolts);

    const g = this.g;
    g.clear();
    for (const l of this.lines) {
      g.lineStyle(l.width, l.color, l.life / l.max);
      g.lineBetween(l.x1, l.y1, l.x2, l.y2);
    }
    for (const r of this.rings) {
      const k = 1 - r.life / r.max;
      g.lineStyle(1, r.color, 1 - k);
      g.strokeCircle(r.x, r.y, r.r0 + (r.r1 - r.r0) * k);
    }
    for (const b of this.bolts) {
      g.lineStyle(1, b.color, b.life / b.max);
      g.strokePoints(b.pts, false);
      g.lineStyle(1, 0xffffff, (b.life / b.max) * 0.7);
      g.strokePoints(b.pts.map((p) => ({ x: p.x, y: p.y - 1 })), false);
    }
  }
}
