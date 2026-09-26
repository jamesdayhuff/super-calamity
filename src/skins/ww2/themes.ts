import type { ThemeDef } from '../../balance/types';
import { tileKey } from '../keys';

const floors = (t: string) => [tileKey(t, 'floor_0'), tileKey(t, 'floor_1'), tileKey(t, 'floor_2')];

const theme = (
  id: string,
  floorWeights: number[],
  decor: string[],
  pathEdge: string,
  background: string,
  accent: number,
): ThemeDef => ({
  id,
  floorTiles: floors(id),
  floorWeights,
  pathTile: tileKey(id, 'path'),
  decor,
  pathEdge,
  background,
  accent,
});

export const WW2_THEMES: Record<string, ThemeDef> = {
  hedgerow: theme('hedgerow', [0.65, 0.25, 0.1], ['decor_tree', 'decor_sandbags'], '#2b2820', '#141a10', 0x6b8f3f),
  stalingrad: theme('stalingrad', [0.6, 0.25, 0.15], ['decor_ruin', 'decor_wreck'], '#1c1a16', '#1a1916', 0xb5451b),
  ardennes: theme('ardennes', [0.6, 0.28, 0.12], ['decor_tree', 'decor_barbedwire'], '#3a4048', '#1a1f24', 0x9db4bf),
  desert: theme('desert', [0.55, 0.3, 0.15], ['decor_dune', 'decor_crate_ammo'], '#5c4326', '#2a2114', 0xf0a830),
  rhine: theme('rhine', [0.6, 0.25, 0.15], ['decor_pontoon', 'decor_barbedwire'], '#1c2630', '#101820', 0x5a7385),
};
