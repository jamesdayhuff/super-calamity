import type * as Phaser from 'phaser';
import { GAME_TITLE, GAME_W, SCENES } from '../constants';
import { skin } from '../skins/registry';
import { progression } from '../state';
import { addText, Button, COLORS } from '../ui/widgets';

/** Shared header for the between-run menus: title, tabs and meta-currency balance. */
export function addMenuChrome(scene: Phaser.Scene, active: 'levels' | 'armory'): void {
  const s = skin();
  s.backdrop(scene);
  addText(scene, 16, 8, GAME_TITLE, { size: 16, color: COLORS.gold });
  addText(scene, 16, 26, s.strings.subtitle, { color: COLORS.dim });

  new Button(scene, 16, 40, 88, 16, {
    label: s.strings.levelsTabLabel,
    color: active === 'levels' ? COLORS.gold : COLORS.dim,
    onClick: () => active !== 'levels' && scene.scene.start(SCENES.mapSelect),
  }).setSelected(active === 'levels');
  new Button(scene, 108, 40, 88, 16, {
    label: s.strings.armoryLabel,
    color: active === 'armory' ? COLORS.gold : COLORS.dim,
    onClick: () => active !== 'armory' && scene.scene.start(SCENES.armory),
  }).setSelected(active === 'armory');

  new Button(scene, 200, 40, 72, 16, {
    label: 'WORLD',
    color: COLORS.dim,
    onClick: () => scene.scene.start(SCENES.skinSelect),
  });

  scene.add.image(GAME_W - 16 - 4, 48, 'icon_core');
  const bal = addText(scene, GAME_W - 28, 44, `${progression.current.metaCurrency}`, { color: COLORS.cyan, originX: 1 });
  const off = progression.events.on('change', () => bal.setText(`${progression.current.metaCurrency}`));
  scene.events.once('shutdown', off);
}
