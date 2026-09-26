import type * as Phaser from 'phaser';
import { getSkin } from '../skins/registry';
import type { ResolvedSkin, SkinId } from '../skins/types';
import { buildPreviewTextures, buildTextures, TEXTURE_FILES, type TextureSource } from './manifest';
import { expandArt, TRANSPARENT, type PixelArt } from './pixel';
import { TILE_SIZE, type TileVariant } from './tileTypes';

type TM = Phaser.Textures.TextureManager;

/** Keys baked for the skin currently resident in the texture manager, so they can be cleared. */
let bakedKeys: string[] = [];

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

function bakePixel(tm: TM, key: string, art: PixelArt): void {
  const { frames, w, h } = expandArt(art);
  const [canvas, ctx] = makeCanvas(w * frames.length, h);
  frames.forEach((rows, fi) => {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const color = art.palette[ch];
        if (!color || color === TRANSPARENT) continue;
        ctx.fillStyle = color;
        ctx.fillRect(fi * w + x, y, 1, 1);
      }
    });
  });
  const tex = tm.addCanvas(key, canvas);
  frames.forEach((_, i) => tex?.add(i, 0, i * w, 0, w, h));
}

function bakeTile(tm: TM, key: string, skinId: SkinId, theme: string, variant: TileVariant): void {
  const [canvas, ctx] = makeCanvas(TILE_SIZE, TILE_SIZE);
  getSkin(skinId).art.drawTile(
    (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    },
    theme,
    variant,
  );
  tm.addCanvas(key, canvas)?.add(0, 0, 0, 0, TILE_SIZE, TILE_SIZE);
}

/** Frame name to use for the first frame of a texture (baked textures have frame 0; plain images only __BASE). */
export function firstFrame(tm: TM, key: string): string | number {
  return tm.get(key).has('0') ? 0 : '__BASE';
}

/** Draw the first frame of a texture into a 2D context, centered in a box of size (bw, bh) at (dx, dy). */
export function drawTextureFrame(
  ctx: CanvasRenderingContext2D,
  tm: TM,
  key: string,
  dx: number,
  dy: number,
  bw = 16,
  bh = 16,
): void {
  if (!tm.exists(key)) return;
  const f = tm.getFrame(key, firstFrame(tm, key));
  const ox = Math.floor((bw - f.cutWidth) / 2);
  const oy = Math.floor((bh - f.cutHeight) / 2);
  ctx.drawImage(
    f.source.image as CanvasImageSource,
    f.cutX,
    f.cutY,
    f.cutWidth,
    f.cutHeight,
    dx + ox,
    dy + oy,
    f.cutWidth,
    f.cutHeight,
  );
}

function bakeComposite(tm: TM, key: string, layers: string[], size: number): void {
  const [canvas, ctx] = makeCanvas(size, size);
  for (const layer of layers) drawTextureFrame(ctx, tm, layer, 0, 0, size, size);
  tm.addCanvas(key, canvas)?.add(0, 0, 0, 0, size, size);
}

function bake(scene: Phaser.Scene, textures: Record<string, TextureSource>): void {
  const tm = scene.textures;
  const entries = Object.entries(textures);
  for (const [key, src] of entries) {
    if (tm.exists(key)) continue;
    if (src.kind === 'pixel') bakePixel(tm, key, src.art);
    else if (src.kind === 'tile') bakeTile(tm, key, src.skin, src.theme, src.variant);
  }
  // Composites layer already-baked textures, so they need a second pass.
  for (const [key, src] of entries) {
    if (src.kind === 'composite' && !tm.exists(key)) bakeComposite(tm, key, src.layers, src.size);
  }
  createAnimations(scene, Object.keys(textures));
}

/**
 * Remove the previously baked skin's textures and animations. Called before baking a new skin so
 * a switch can't leave stale sprites behind (keys are shared between skins by design).
 */
export function clearSkinTextures(scene: Phaser.Scene): void {
  for (const key of bakedKeys) {
    const animKey = `${key}_anim`;
    if (scene.anims.exists(animKey)) scene.anims.remove(animKey);
    // File overrides are loaded once by Preload and must survive a skin switch.
    if (!TEXTURE_FILES[key] && scene.textures.exists(key)) scene.textures.remove(key);
  }
  bakedKeys = [];
}

/** Generate every procedural texture for `s` not already provided by a file override. */
export function bakeSkinTextures(scene: Phaser.Scene, s: ResolvedSkin): void {
  const textures = buildTextures(s);
  bake(scene, textures);
  bakedKeys = Object.keys(textures);
}

/** Bake the per-skin card sprites used by the skin-select screen. Stable across skin switches. */
export function bakePreviewTextures(scene: Phaser.Scene): void {
  bake(scene, buildPreviewTextures());
}

/** Every multi-frame texture gets a `<key>_anim` animation. */
function createAnimations(scene: Phaser.Scene, keys: string[]): void {
  for (const key of new Set([...keys, ...Object.keys(TEXTURE_FILES)])) {
    if (!scene.textures.exists(key)) continue;
    const names = scene.textures
      .get(key)
      .getFrameNames(false)
      .filter((n) => /^\d+$/.test(n))
      .sort((a, b) => Number(a) - Number(b));
    if (names.length < 2) continue;
    const animKey = `${key}_anim`;
    if (scene.anims.exists(animKey)) continue;
    const oneShot = key.startsWith('fx_explosion');
    scene.anims.create({
      key: animKey,
      frames: names.map((frame) => ({ key, frame })),
      frameRate: oneShot ? 16 : 6,
      repeat: oneShot ? 0 : -1,
    });
  }
}
