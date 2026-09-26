import type * as Phaser from 'phaser';
import type { EffectsLike } from '../game/World';

/**
 * Headless stand-ins so World / Enemy / Tower / Combat run without Phaser or a canvas
 * (balance simulations and gameplay tests). Game objects accept any method call and keep
 * the few numeric fields gameplay reads back (position, rotation, size).
 */
function stubGameObject(): unknown {
  const state: Record<string | symbol, unknown> = { x: 0, y: 0, rotation: 0, width: 16, height: 16 };
  const proxy: unknown = new Proxy(state, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'setRotation') return (r: number) => ((target.rotation = r), proxy);
      if (prop === 'setPosition') return (x: number, y?: number) => ((target.x = x), (target.y = y ?? x), proxy);
      return () => proxy;
    },
  });
  return proxy;
}

export function createStubScene(): Phaser.Scene {
  const factory = new Proxy({}, { get: () => () => stubGameObject() });
  return {
    add: factory,
    tweens: { add: () => null },
    time: { delayedCall: () => null },
    anims: { exists: () => false },
    textures: { get: () => ({ has: () => false }) },
  } as unknown as Phaser.Scene;
}

export function createStubEffects(): EffectsLike {
  const noop = () => {};
  return { beam: noop, ring: noop, bolt: noop, explosion: noop, sparks: noop, floatIcon: noop, floatText: noop };
}
