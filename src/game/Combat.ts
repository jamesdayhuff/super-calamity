import { audio } from '../assets/audio/AudioManager';
import { COMBAT } from '../balance/combat';
import type { Enemy } from './Enemy';
import { Orb, Shell } from './Projectile';
import type { Tower } from './Tower';
import type { World } from './World';

const dist2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) ** 2 + (ay - by) ** 2;

function inRange(x: number, y: number, e: Enemy, range: number): boolean {
  const r = range + e.def.radius;
  return dist2(x, y, e.x, e.y) <= r * r;
}

/** Distance from point P to segment AB. */
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1)));
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
}

/** Tower targeting, attacks, support auras and projectile resolution. */
export class Combat {
  private shells: Shell[] = [];
  private orbs: Orb[] = [];

  constructor(private readonly world: World) {}

  update(dt: number): void {
    this.applySupport();

    for (const t of this.world.towers) {
      t.update(dt);
      if (t.def.attack === 'support') continue;
      t.cooldown -= dt;
      if (t.cooldown > 0) continue;
      t.cooldown = this.fire(t) ? 1 / (t.stats.fireRate * (1 + t.buff.fireRate)) : 0;
    }

    this.shells = this.shells.filter((s) => {
      if (!s.update(dt)) return true;
      this.explode(s);
      s.destroy();
      return false;
    });

    this.orbs = this.orbs.filter((o) => {
      if (!o.update(dt)) return true;
      this.orbImpact(o);
      o.destroy();
      return false;
    });
  }

  clear(): void {
    this.shells.forEach((s) => s.destroy());
    this.orbs.forEach((o) => o.destroy());
    this.shells = [];
    this.orbs = [];
  }

  /** Drone Bays: buff towers in range (strongest applies, no stacking) and reveal cloaked enemies. */
  private applySupport(): void {
    const towers = this.world.towers;
    for (const t of towers) {
      t.buff.fireRate = 0;
      t.buff.damage = 0;
    }
    for (const d of towers) {
      if (d.def.attack !== 'support') continue;
      const s = d.stats;
      const r2 = s.range * s.range;
      if (s.buff) {
        for (const t of towers) {
          if (t === d || t.def.attack === 'support' || dist2(d.x, d.y, t.x, t.y) > r2) continue;
          t.buff.fireRate = Math.max(t.buff.fireRate, s.buff.fireRate);
          t.buff.damage = Math.max(t.buff.damage, s.buff.damage);
        }
      }
      if (s.sensor) {
        for (const e of this.world.enemies) if (e.alive && inRange(d.x, d.y, e, s.range)) e.revealTimer = COMBAT.revealLinger;
      }
    }
  }

  private pickTarget(t: Tower): Enemy | null {
    let best: Enemy | null = null;
    let bestScore = -Infinity;
    for (const e of this.world.enemies) {
      if (!e.targetable || !inRange(t.x, t.y, e, t.stats.range)) continue;
      const score = t.targetMode === 'first' ? e.distance : t.targetMode === 'last' ? -e.distance : e.hp + e.shield;
      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    }
    return best;
  }

  /** Returns true if the tower attacked. */
  private fire(t: Tower): boolean {
    const w = this.world;
    const s = t.stats;
    const dmg = s.damage * (1 + t.buff.damage);
    const type = t.def.damageType;
    const fx = w.effects;
    const color = t.def.color;

    // Pulse towers hit everything around them, including cloaked enemies.
    if (t.def.attack === 'pulse') {
      const hits = w.enemies.filter((e) => e.alive && inRange(t.x, t.y, e, s.range));
      if (!hits.length) return false;
      for (const e of hits) {
        w.damageEnemy(e, dmg, type, t);
        if (s.slow && e.alive) e.applySlow(s.slow.factor, s.slow.duration);
      }
      fx.ring(t.x, t.y, 4, s.range, color, 0.35);
      audio.play(t.def.sfx.fire, 150);
      return true;
    }

    const target = this.pickTarget(t);
    if (!target) return false;
    t.aimAt(target.x, target.y);
    const m = t.muzzle();

    switch (t.def.attack) {
      case 'beam': {
        fx.beam(m.x, m.y, target.x, target.y, color, 1, 0.07);
        fx.beam(m.x, m.y, target.x, target.y, 0xffffff, 1, 0.03);
        w.damageEnemy(target, dmg, type, t);
        break;
      }
      case 'rail': {
        const ang = Math.atan2(target.y - t.y, target.x - t.x);
        const ex = t.x + Math.cos(ang) * s.range;
        const ey = t.y + Math.sin(ang) * s.range;
        const hits = s.pierce
          ? w.enemies.filter((e) => e.alive && segDist(e.x, e.y, m.x, m.y, ex, ey) <= e.def.radius + 2)
          : [target];
        const endX = s.pierce ? ex : target.x;
        const endY = s.pierce ? ey : target.y;
        fx.beam(m.x, m.y, endX, endY, color, 3, 0.2);
        fx.beam(m.x, m.y, endX, endY, 0xffffff, 1, 0.25);
        for (const e of hits) w.damageEnemy(e, dmg, type, t);
        fx.sparks(target.x, target.y, 5);
        break;
      }
      case 'mortar': {
        const flight = 0.75 / (s.projectileSpeed ?? 1);
        const land = w.path.pointAt(target.distance + target.currentSpeed * flight);
        this.shells.push(new Shell(w.scene, t.x, t.y - 3, land.x, land.y, flight, { damage: dmg, splash: s.splashRadius ?? 16, type, source: t }));
        break;
      }
      case 'orb': {
        this.orbs.push(new Orb(w.scene, m.x, m.y, target, s.projectileSpeed ?? 150, { damage: dmg, splash: s.splashRadius ?? 0, type, source: t }));
        break;
      }
      case 'chain': {
        const chain = s.chain ?? { targets: 1, falloff: 1, jumpRange: 0 };
        const hit = new Set<Enemy>([target]);
        const points = [{ x: t.x, y: t.y - 5 }, { x: target.x, y: target.y }];
        let cur = target;
        let d = dmg;
        w.damageEnemy(target, d, type, t);
        for (let i = 1; i < chain.targets; i++) {
          // Chain bounces can arc into cloaked enemies.
          let next: Enemy | null = null;
          let nd = chain.jumpRange * chain.jumpRange;
          for (const e of w.enemies) {
            if (!e.alive || hit.has(e)) continue;
            const dd = dist2(cur.x, cur.y, e.x, e.y);
            if (dd <= nd) {
              nd = dd;
              next = e;
            }
          }
          if (!next) break;
          d *= chain.falloff;
          hit.add(next);
          points.push({ x: next.x, y: next.y });
          w.damageEnemy(next, d, type, t);
          cur = next;
        }
        fx.bolt(points, color);
        break;
      }
    }
    audio.play(t.def.sfx.fire, t.def.attack === 'beam' ? 70 : 90);
    return true;
  }

  private explode(s: Shell): void {
    const { damage, splash, type, source } = s.payload;
    this.world.effects.explosion(s.tx, s.ty, splash / 16);
    audio.play('boom', 90);
    for (const e of [...this.world.enemies]) {
      if (e.alive && inRange(s.tx, s.ty, e, splash)) this.world.damageEnemy(e, damage, type, source);
    }
  }

  private orbImpact(o: Orb): void {
    const { damage, splash, type, source } = o.payload;
    if (o.target.alive) this.world.damageEnemy(o.target, damage, type, source);
    if (splash > 0) {
      for (const e of [...this.world.enemies]) {
        if (e !== o.target && e.alive && inRange(o.x, o.y, e, splash)) this.world.damageEnemy(e, damage * 0.5, type, source);
      }
    }
    this.world.effects.ring(o.x, o.y, 2, Math.max(8, splash), source.def.color, 0.2);
    this.world.effects.sparks(o.x, o.y, 3, 0x73eff7);
  }
}
