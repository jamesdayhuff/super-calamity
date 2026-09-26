import type { EnemyArchetype } from '../../../balance/archetypes';
import { recolor, type PixelArt } from '../../../assets/pixel';
import { C, SPACE_ART_PALETTE } from './palette';

// All enemies face right; the game flips them horizontally when moving left.
const P = SPACE_ART_PALETTE;

const SCOUT: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['............', '.ooo........', '.orroo......', '..orrmmoo...', '..ommlllBo..', 'Rommllllwwo.'],
    ['............', '.ooo........', '.orroo......', '..orrmmoo...', '..ommlllBo..', 'yommllllwwo.'],
  ],
};

const ARMORED: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['..oooooooooo..', '.oddddddddddo.', '.odmdmdmdmdmo.', '.oooooooooooo.', '..ommmmmmmmo..', '..omllllllmooo', '..omlrrlllmlll'],
    ['..oooooooooo..', '.oddddddddddo.', '.omdmdmdmdmdo.', '.oooooooooooo.', '..ommmmmmmmo..', '..omllllllmooo', '..omlrrlllmlll'],
  ],
};

const GRUNT: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['o.o.....', '.oGGo...', '.oggGo..', 'oggggwo.'],
    ['.o.o....', '.oGGo...', '.oggGo..', 'oggggwo.'],
  ],
};

const SHIELDED: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['....oooooo....', '...obbbbbbo...', '..obBBBBBBbo..', '.obBnnnnnnBbo.', '.obBnlllllnBbo', '.obBnlccclnBbo', '.obBnlcwwcnBbo'],
    ['....oooooo....', '...obbbbbbo...', '..obBBBBBBbo..', '.obBnnnnnnBbo.', '.obBnlllllnBbo', '.obBnlBBBlnBbo', '.obBnlBccBnBbo'],
  ],
};

const SPLITTER: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['..oooooooooo..', '.oRRRRRRRRRRo.', '.oRyyRRRRyyRo.', '.oRyrRRRRryRo.', '.oRRRRwwRRRRo.', '.orrrrrrrrrro.', '..oooo..oooo..'],
    ['..oooooooooo..', '.oRRRRRRRRRRo.', '.oRyyRRRRyyRo.', '.oRyrRRRRryRo.', '.oRRRRwwRRRRo.', '.orrrrrrrrrro.', '..oooooooooo..'],
  ],
};

const SPLITLING: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['........', '.oooooo.', '.oRyyRo.', '.orrrro.'],
    ['........', '.oooooo.', '.oRRRRo.', '.orrrro.'],
  ],
};

const HEALER: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['oo........oo', '.oooooooooo.', '.olllGGlllo.', '.olllGGlllo.', '.oGGGGGGGGo.', '.oGGGGGGGGo.'],
    ['.oo......oo.', '.oooooooooo.', '.olllGGlllo.', '.olllGGlllo.', '.oGGGGGGGGo.', '.oGGGGGGGGo.'],
  ],
};

const STEALTH: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['............', 'oo..........', 'oppoo.......', '.opppoooo...', '.oppPPPPPoo.', 'oppPPcccPPPo'],
    ['............', 'oo..........', 'oppoo.......', '.opppoooo...', '.oppPPPPPoo.', 'oppPPcwcPPPo'],
  ],
};

// Boss archetype: a = armor, A = armor highlight, s = shadow, t = cannon trim, e = eyes, k/w = core glow.
const BOSS_ROWS = [
  '........................',
  '...oooooooo.............',
  '..oaaaaaaaaoooooooo.....',
  '..oaAAAAAAaattttttto....',
  '..oaAAAAAAaaoooooooo....',
  '...oaaaaaaaao...........',
  '....ossssssssoooo.......',
  '...osaaaaaaaaaaaaoo.....',
  '..osaAAAAAAAAaaaaaao....',
  '..osaAkkkkAAAaaaeeao....',
  '.ttsaAkwwkAAAaaaeeaao...',
  '.ttsaAkwwkAAAaaaaaaaaao.',
];
const BOSS_ROWS_PULSE = BOSS_ROWS.map((r) => r.replace(/w/g, 'K').replace(/k/g, 'w').replace(/K/g, 'k'));

const BOSS_BASE: PixelArt = {
  mirrorY: true,
  frames: [BOSS_ROWS, BOSS_ROWS_PULSE],
  palette: { ...P, a: C.metal, A: C.light, s: C.dark, t: C.red, e: C.red, k: C.orange, w: C.yellow },
};

export const SPACE_ENEMY_ART: Record<EnemyArchetype, PixelArt> = {
  scout: SCOUT,
  armored: ARMORED,
  grunt: GRUNT,
  shielded: SHIELDED,
  splitter: SPLITTER,
  splitling: SPLITLING,
  healer: HEALER,
  stealth: STEALTH,
  boss_1: BOSS_BASE,
  boss_2: recolor(BOSS_BASE, { a: C.blue, A: C.sky, s: C.navy, t: C.cyan, e: C.cyan, k: C.sky, w: C.white }),
  boss_3: recolor(BOSS_BASE, { a: C.red, A: C.orange, s: C.purple, t: C.yellow, e: C.yellow, k: C.yellow, w: C.white }),
  boss_4: recolor(BOSS_BASE, { a: C.green, A: C.lime, s: C.teal, t: C.sky, e: C.white, k: C.lime, w: C.white }),
  boss_5: recolor(BOSS_BASE, { a: C.purple, A: C.violet, s: C.outline, t: C.lilac, e: C.cyan, k: C.violet, w: C.lilac }),
};
