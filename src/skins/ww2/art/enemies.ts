import type { EnemyArchetype } from '../../../balance/archetypes';
import { recolor, type PixelArt } from '../../../assets/pixel';
import { C, WW2_ART_PALETTE } from './palette';

// All enemies face right; the game flips them horizontally when moving left.
const P = WW2_ART_PALETTE;

/** Motorcycle scout: rider low over the bars, wheels turning. */
const SCOUT: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['............', '....oo......', '...odmo.....', '..omllmoo...', '.ommlldddo..', 'oPoommmmoPo.'],
    ['............', '....oo......', '...odmo.....', '..omllmoo...', '.ommlldddo..', 'oPooommmmoPo'],
  ],
};

/** Panzer IV: boxy hull, turret and a long gun. */
const ARMORED: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['..oooooooo....', '.odddddddo....', '.odmmmmmdooooo', '.oddddddddmmmo', '.oooooooooooo.', '.ommmmmmmmmmo.', '.oPoPoPoPoPoo.'],
    ['..oooooooo....', '.odddddddo....', '.odmmmmmdooooo', '.oddddddddmmmo', '.oooooooooooo.', '.ommmmmmmmmmo.', '.oPPoPoPoPoPo.'],
  ],
};

/** Infantry squad: a helmet and a rifle, running. */
const GRUNT: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['..oo....', '.ollmo..', '.omllo..', 'o.oddo.w'],
    ['..oo....', '.ollmo..', '.omllo..', '.ooddoow'],
  ],
};

/** Tiger tank: heavy frontal plate — this world's "shield". */
const SHIELDED: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['...oooooooo...', '..obbbbbbbbo..', '.obBBBBBBBBbo.', '.obBnnnnnnBbo.', '.obBnmmmmmnBbo', '.obBnmllllnBbo', '.obBnmlwwlnBbo'],
    ['...oooooooo...', '..obbbbbbbbo..', '.obBBBBBBBBbo.', '.obBnnnnnnBbo.', '.obBnmmmmmnBbo', '.obBnmBBBBnBbo', '.obBnmBwwBnBbo'],
  ],
};

/** Troop truck: canvas-backed lorry that dumps infantry when it dies. */
const SPLITTER: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['..oooooooo....', '.oPPPPPPPPo...', '.oPGGPPGGPoooo', '.oPGmPPGmPollo', '.oPPPPPPPPoooo', '.ommmmmmmmmmmo', '..oo.oo..oo.o.'],
    ['..oooooooo....', '.oPPPPPPPPo...', '.oPGGPPGGPoooo', '.oPGmPPGmPollo', '.oPPPPPPPPoooo', '.ommmmmmmmmmmo', '..ooooo..ooooo'],
  ],
};

/** A single infantryman spilled from the truck. */
const SPLITLING: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['........', '.oooooo.', '.oGllGo.', '.odmmdo.'],
    ['........', '.oooooo.', '.oGGGGo.', '.odmmdo.'],
  ],
};

/** Field medic halftrack: white cross, patches the column. */
const HEALER: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['oo........oo', '.oooooooooo.', '.owwwrrwwwo.', '.owrrrrrrwo.', '.olllllllllo', '.oPoPoPoPPo.'],
    ['.oo......oo.', '.oooooooooo.', '.owwwrrwwwo.', '.owrrrrrrwo.', '.olllllllllo', '.oPPoPoPoPo.'],
  ],
};

/** Camouflaged sniper: ghillie suit, only the scope glints. */
const STEALTH: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['............', 'o...........', 'oggoo.......', '.ogggoooo...', '.oggGGGGGoo.', 'oggGGmmmGGGo'],
    ['............', 'o...........', 'oggoo.......', '.ogggoooo...', '.oggGGGGGoo.', 'oggGGmcmGGGo'],
  ],
};

// Boss: a heavy assault gun. a = plate, A = highlight, s = shadow, t = barrel, e = vision slit, k/w = exhaust glow.
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
  palette: {
    ...P,
    a: C.olive,
    A: C.fieldGrey,
    s: C.darkOlive,
    t: C.gunmetal,
    e: C.flash,
    k: C.rust,
    w: C.flash,
  },
};

export const WW2_ENEMY_ART: Record<EnemyArchetype, PixelArt> = {
  scout: SCOUT,
  armored: ARMORED,
  grunt: GRUNT,
  shielded: SHIELDED,
  splitter: SPLITTER,
  splitling: SPLITLING,
  healer: HEALER,
  stealth: STEALTH,
  // Ferdinand — factory primer red.
  boss_1: BOSS_BASE,
  // King Tiger — three-tone ambush camouflage.
  boss_2: recolor(BOSS_BASE, { a: C.earth, A: C.mud, s: C.mudDark, t: C.gunmetal, e: C.coldSky, k: C.flash, w: C.bone }),
  // Sturmtiger — rocket mortar, scorched.
  boss_3: recolor(BOSS_BASE, { a: C.blood, A: C.rust, s: C.outline, t: C.darkOlive, e: C.flash, k: C.flash, w: C.bone }),
  // Maus — cold steel, overengineered.
  boss_4: recolor(BOSS_BASE, { a: C.steelDark, A: C.steel, s: C.gunmetal, t: C.coldSky, e: C.bone, k: C.coldSky, w: C.bone }),
  // Ratte — winter whitewash over grey.
  boss_5: recolor(BOSS_BASE, { a: C.fieldGrey, A: C.bone, s: C.steelDark, t: C.gunmetal, e: C.rust, k: C.coldSky, w: C.bone }),
};
