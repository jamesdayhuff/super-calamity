import type { TowerArchetype } from '../../balance/archetypes';
import type { SkinArt } from '../../skins/types';
import { TRANSPARENT, type PixelArt } from '../pixel';

/**
 * Builds tower art from a skin's platform + head rows. Level is expressed purely through palette:
 * the accent ramp brightens, the platform trim turns to the skin's L3 trim color, and pixels marked
 * '3' in the head rows only appear at level 3.
 */
export function towerBaseArt(art: SkinArt, id: TowerArchetype, level: 1 | 2 | 3): PixelArt {
  const [dim, bright, light] = art.towers.accents[id];
  return {
    mirrorX: true,
    mirrorY: true,
    frames: [art.towers.basePlatform],
    palette: {
      ...art.palette,
      a: level === 1 ? dim : level === 2 ? bright : light,
      x: level === 3 ? art.towers.trimL3 : art.palette.m,
      l: level === 3 ? art.palette.w : art.palette.l,
    },
  };
}

export function towerHeadArt(art: SkinArt, id: TowerArchetype, level: 1 | 2 | 3): PixelArt {
  const [, bright, light] = art.towers.accents[id];
  const head = art.towers.heads[id];
  return {
    mirrorX: head.mirrorX,
    mirrorY: true,
    frames: [head.rows],
    palette: {
      ...art.palette,
      A: level === 1 ? bright : light,
      P: bright,
      '3': level === 3 ? (art.towers.l3Trim?.[id] ?? light) : TRANSPARENT,
    },
  };
}
