/** Tile variants every skin's `drawTile` must handle. Split out so skins need not import the baker. */
export type TileVariant = 'floor_0' | 'floor_1' | 'floor_2' | 'path' | 'void';

export const TILE_VARIANTS: TileVariant[] = ['floor_0', 'floor_1', 'floor_2', 'path'];

/** Logical size of one tile in pixels. */
export const TILE_SIZE = 16;
