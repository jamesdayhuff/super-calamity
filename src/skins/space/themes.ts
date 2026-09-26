import { tileKey } from '../keys';
import type { ThemeDef } from '../../balance/types';

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

export const SPACE_THEMES: Record<string, ThemeDef> = {
  station: theme('station', [0.7, 0.2, 0.1], ['decor_crate', 'decor_console'], '#0b0d1a', '#0b0d1a', 0x41a6f6),
  asteroid: theme('asteroid', [0.6, 0.3, 0.1], ['decor_rock', 'decor_crystal'], '#2b2020', '#150f10', 0x73eff7),
  derelict: theme('derelict', [0.6, 0.25, 0.15], ['decor_debris', 'decor_pipe'], '#0a1010', '#0a1010', 0xa7f070),
  planet: theme('planet', [0.6, 0.3, 0.1], ['decor_rock_red', 'decor_antenna'], '#3e1d1b', '#1e0e0c', 0xef7d57),
  orbital: theme('orbital', [0.75, 0.15, 0.1], ['decor_void'], '#1a1c2c', '#05060f', 0xc77dff),
};
