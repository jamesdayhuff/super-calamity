import { describe, expect, it } from 'vitest';
import { SHARED_ICON_ROWS } from '../src/assets/sprites/icons';

/**
 * Guards the one failure mode the other suites cannot see: runtime code naming a texture by a
 * string literal instead of going through `TEX`. The headless sim stubs the texture manager, so a
 * key that has drifted from the manifest surfaces only in a real browser, as Phaser's green
 * missing-texture box.
 *
 * Keys built from a content id (`tower_${id}_base_1`) are template literals, not matched here, and
 * are covered by the manifest checks in config.test.ts.
 */
const SOURCES = import.meta.glob('../src/{game,scenes,ui}/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

/** Shared across every skin and never renamed, so a literal is fine. */
const ALLOWED = new Set([...Object.keys(SHARED_ICON_ROWS), 'icon_credit', 'icon_core']);

const SKIN_OWNED = /'((?:fx_|proj_|tile_|tower_|enemy_|base_object)[a-z0-9_]*)'/g;

describe('texture keys', () => {
  it('scans the runtime source files', () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(10);
  });

  it('runtime code never hardcodes a skin-owned texture key', () => {
    const offenders: string[] = [];
    for (const [file, src] of Object.entries(SOURCES)) {
      src.split('\n').forEach((line, i) => {
        for (const m of line.matchAll(SKIN_OWNED)) {
          if (!ALLOWED.has(m[1])) offenders.push(`${file}:${i + 1}  '${m[1]}'`);
        }
      });
    }
    expect(offenders, `use TEX or the skin's defs instead of a literal:\n${offenders.join('\n')}`).toEqual([]);
  });
});
