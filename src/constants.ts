// Screen layout (logical pixels). The canvas is scaled up to fit the window with nearest-neighbour filtering.
export const GAME_W = 480;
export const GAME_H = 270;
export const TILE = 16;
export const COLS = 30;
export const ROWS = 14;
/** Top HUD bar height; the playfield grid starts below it. */
export const PLAY_Y = 14;
export const PLAY_H = ROWS * TILE;
/** Bottom tower bar starts here. */
export const BAR_Y = PLAY_Y + PLAY_H;

export const FONT = '"Press Start 2P", monospace';

/** The product name. Each skin's world name is its `strings.subtitle`. */
export const GAME_TITLE = 'SUPER CALAMITY';

export const DEPTH = {
  background: 0,
  decor: 1,
  base: 2,
  rangePreview: 3,
  tower: 4,
  enemy: 5,
  projectile: 6,
  effects: 7,
  bars: 8,
  ghost: 9,
} as const;

export const SCENES = {
  boot: 'Boot',
  preload: 'Preload',
  skinSelect: 'SkinSelect',
  mapSelect: 'MapSelect',
  armory: 'Armory',
  game: 'Game',
  hud: 'HUD',
  pause: 'Pause',
  result: 'Result',
} as const;
