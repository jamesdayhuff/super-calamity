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

export const WEST_THEMES: Record<string, ThemeDef> = {
  mainstreet: theme('mainstreet', [0.65, 0.2, 0.15], ['decor_barrel', 'decor_crate_west'], '#3d2a1a', '#1a1109', 0xf0c040),
  canyon: theme('canyon', [0.55, 0.3, 0.15], ['decor_rock_red', 'decor_skull'], '#4a1f18', '#241210', 0xc85a2e),
  goldmine: theme('goldmine', [0.6, 0.25, 0.15], ['decor_minecart', 'decor_crate_west'], '#241812', '#181008', 0xf0c040),
  prairie: theme('prairie', [0.6, 0.25, 0.15], ['decor_cactus', 'decor_tumbleweed'], '#5c4326', '#2a2a14', 0x7fa05a),
  railjunction: theme('railjunction', [0.6, 0.25, 0.15], ['decor_sleeper', 'decor_barrel'], '#2a3038', '#1a1a1a', 0x7d8f9c),
};
