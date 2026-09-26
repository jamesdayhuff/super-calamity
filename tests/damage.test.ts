import { describe, expect, it } from 'vitest';
import { applyDamage } from '../src/systems/DamageModel';

describe('applyDamage', () => {
  it('hits hull directly when there is no shield', () => {
    const t = { hp: 50, shield: 0 };
    const r = applyDamage(t, 20, 'kinetic');
    expect(t.hp).toBe(30);
    expect(r.hullDamage).toBe(20);
    expect(r.killed).toBe(false);
  });

  it('shield absorbs damage before hull, scaled by type multiplier', () => {
    const t = { hp: 50, shield: 30 };
    const r = applyDamage(t, 10, 'kinetic'); // 10 * 0.6 = 6 shield damage
    expect(t.shield).toBeCloseTo(24);
    expect(t.hp).toBe(50);
    expect(r.shieldDamage).toBeCloseTo(6);
  });

  it('EMP breaks shields far faster than kinetic', () => {
    const kinetic = { hp: 50, shield: 60 };
    const emp = { hp: 50, shield: 60 };
    applyDamage(kinetic, 20, 'kinetic');
    applyDamage(emp, 20, 'emp');
    expect(emp.shield).toBe(0);
    expect(kinetic.shield).toBeGreaterThan(0);
  });

  it('carries leftover raw damage through to hull after breaking the shield', () => {
    const t = { hp: 50, shield: 10 };
    const r = applyDamage(t, 10, 'emp'); // 30 effective vs 10 shield; 10 - 10/3 raw left; x0.4 hull
    expect(r.shieldBroken).toBe(true);
    expect(t.shield).toBe(0);
    expect(r.hullDamage).toBeCloseTo((10 - 10 / 3) * 0.4);
  });

  it('never drops hp below zero and flags kills', () => {
    const t = { hp: 5, shield: 0 };
    const r = applyDamage(t, 100, 'explosive');
    expect(t.hp).toBe(0);
    expect(r.hullDamage).toBe(5);
    expect(r.killed).toBe(true);
  });
});
