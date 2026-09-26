import * as Phaser from 'phaser';
import { audio } from '../assets/audio/AudioManager';
import type { SfxEvent } from '../assets/audio/events';
import { FONT } from '../constants';
import { SPACE_UI_PALETTE } from '../skins/space/art/palette';
import type { SkinPalette } from '../skins/types';

/**
 * The live UI palette. Every scene reads `COLORS.gold` and friends directly, so a skin switch
 * mutates this object in place rather than rebinding it — importers all hold the same reference.
 * Scenes are restarted on a switch, so nothing keeps a stale color in a drawn Graphics.
 */
export const COLORS: SkinPalette = { ...SPACE_UI_PALETTE };

/** '#rrggbb' -> 0xrrggbb, for the Graphics API which takes numbers where Text takes strings. */
export const numColor = (hex: string): number => parseInt(hex.slice(1), 16);

export function applySkinPalette(p: SkinPalette): void {
  Object.assign(COLORS, p);
}

export interface TextOpts {
  color?: string;
  size?: number;
  align?: 'left' | 'center' | 'right';
  wrap?: number;
  originX?: number;
  originY?: number;
}

export function addText(scene: Phaser.Scene, x: number, y: number, str: string, o: TextOpts = {}): Phaser.GameObjects.Text {
  const t = scene.add.text(Math.round(x), Math.round(y), str, {
    fontFamily: FONT,
    fontSize: `${o.size ?? 8}px`,
    color: o.color ?? COLORS.text,
    align: o.align ?? 'left',
    lineSpacing: 3,
    wordWrap: o.wrap ? { width: o.wrap } : undefined,
  });
  t.setOrigin(o.originX ?? 0, o.originY ?? 0);
  return t;
}

/** Pixel-style panel: 1px border, flat fill, faint top highlight. */
export function drawPanel(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number = COLORS.panel,
  border: number = COLORS.border,
): void {
  g.fillStyle(border, 1).fillRect(x, y, w, h);
  g.fillStyle(fill, 1).fillRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle(0xffffff, 0.07).fillRect(x + 1, y + 1, w - 2, 1);
}

export interface ButtonOpts {
  label?: string;
  icon?: string;
  iconOffsetY?: number;
  onClick: () => void;
  onHover?: (over: boolean) => void;
  fill?: number;
  color?: string;
  /** SFX event on click; null for silent. Defaults to 'click'. */
  sfx?: SfxEvent | null;
}

/** Simple pixel button built from a Graphics background, optional icon/label and an interactive Zone. */
export class Button {
  readonly bg: Phaser.GameObjects.Graphics;
  readonly zone: Phaser.GameObjects.Zone;
  label?: Phaser.GameObjects.Text;
  icon?: Phaser.GameObjects.Image;
  private enabled = true;
  private selected = false;
  private hovered = false;

  constructor(
    readonly scene: Phaser.Scene,
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
    private readonly opts: ButtonOpts,
  ) {
    this.bg = scene.add.graphics();
    if (opts.icon) this.icon = scene.add.image(x + w / 2, y + h / 2 + (opts.iconOffsetY ?? 0), opts.icon);
    if (opts.label !== undefined) {
      this.label = addText(scene, x + w / 2, y + h / 2 + 1, opts.label, { color: opts.color, originX: 0.5, originY: 0.5 });
    }
    this.zone = scene.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
    this.zone.on('pointerover', () => {
      this.hovered = true;
      this.redraw();
      opts.onHover?.(true);
    });
    this.zone.on('pointerout', () => {
      this.hovered = false;
      this.redraw();
      opts.onHover?.(false);
    });
    this.zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if ((p.event as MouseEvent).button === 2) return;
      if (!this.enabled) {
        audio.play('error', 0);
        return;
      }
      if (opts.sfx !== null) audio.play(opts.sfx ?? 'click', 0);
      opts.onClick();
    });
    this.redraw();
  }

  private redraw(): void {
    const fill = !this.enabled ? COLORS.disabled : this.hovered ? COLORS.panelHi : (this.opts.fill ?? COLORS.panel);
    const border = this.selected ? COLORS.borderHi : this.hovered && this.enabled ? COLORS.borderHover : COLORS.border;
    this.bg.clear();
    drawPanel(this.bg, this.x, this.y, this.w, this.h, fill, border);
    this.label?.setAlpha(this.enabled ? 1 : 0.45);
    this.icon?.setAlpha(this.enabled ? 1 : 0.35);
  }

  setEnabled(v: boolean): this {
    if (this.enabled !== v) {
      this.enabled = v;
      this.redraw();
    }
    return this;
  }

  setSelected(v: boolean): this {
    if (this.selected !== v) {
      this.selected = v;
      this.redraw();
    }
    return this;
  }

  setLabel(str: string, color?: string): this {
    this.label?.setText(str);
    if (color) this.label?.setColor(color);
    return this;
  }

  setIcon(key: string): this {
    this.icon?.setTexture(key);
    return this;
  }

  setDepth(d: number): this {
    this.bg.setDepth(d);
    this.icon?.setDepth(d + 0.1);
    this.label?.setDepth(d + 0.1);
    this.zone.setDepth(d + 0.2);
    return this;
  }

  destroy(): void {
    this.bg.destroy();
    this.icon?.destroy();
    this.label?.destroy();
    this.zone.destroy();
  }
}

/** Blocky meter of `segments` cells, filled to value (0..1). */
export function drawMeter(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  value: number,
  segments = 10,
  color?: number,
): void {
  const fill = color ?? numColor(COLORS.green);
  for (let i = 0; i < segments; i++) {
    g.fillStyle(i < Math.round(value * segments) ? fill : COLORS.panelDeep, 1).fillRect(x + i * 5, y, 4, 8);
  }
}
