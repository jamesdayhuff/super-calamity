import type { EnemyArchetype } from '../../../balance/archetypes';
import { recolor, type PixelArt } from '../../../assets/pixel';
import { C, WEST_ART_PALETTE } from './palette';

// All enemies face right; the game flips them horizontally when moving left.
const P = WEST_ART_PALETTE;

/** Horse rider: fast, low in the saddle. */
const SCOUT: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['............', '...ooo......', '..odRo......', '..omlmoo....', '.ommmmmmoo..', 'odoommmmmodo'],
    ['............', '...ooo......', '..odRo......', '..omlmoo....', '.ommmmmmoo..', 'oddommmmmood'],
  ],
};

/** Armored stagecoach: iron-shuttered, six-up. */
const ARMORED: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['..oooooooo....', '.odddddddo....', '.odmlmlmdooooo', '.oddddddddmmmo', '.oooooooooooo.', '.ommmmmmmmmmo.', '.odo.odo.odoo.'],
    ['..oooooooo....', '.odddddddo....', '.odlmlmldooooo', '.oddddddddmmmo', '.oooooooooooo.', '.ommmmmmmmmmo.', '.oodo.odo.odo.'],
  ],
};

/** Bandit gang: a hat and a bandana, running. */
const GRUNT: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['.ooo....', 'odddo...', '.olrlo..', 'o.omm.oy'],
    ['.ooo....', 'odddo...', '.olrlo..', '.oomm.oy'],
  ],
};

/** Iron-plated wagon: boiler plate bolted over the boards. */
const SHIELDED: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['...oooooooo...', '..obbbbbbbbo..', '.obBBBBBBBBbo.', '.obBnnnnnnBbo.', '.obBnmmmmmnBbo', '.obBnmllllnBbo', '.obBnmlwwlnBbo'],
    ['...oooooooo...', '..obbbbbbbbo..', '.obBBBBBBBBbo.', '.obBnnnnnnBbo.', '.obBnmmmmmnBbo', '.obBnmBBBBnBbo', '.obBnmBwwBnBbo'],
  ],
};

/** Chuckwagon: spills bandits when it breaks up. */
const SPLITTER: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['..oooooooo....', '.owwwwwwwwo...', '.owllwwllwoooo', '.owlmwwlmwollo', '.oddddddddoooo', '.ommmmmmmmmmmo', '..oo.oo..oo.o.'],
    ['..oooooooo....', '.owwwwwwwwo...', '.owllwwllwoooo', '.owlmwwlmwollo', '.oddddddddoooo', '.ommmmmmmmmmmo', '..ooooo..ooooo'],
  ],
};

/** One bandit on foot. */
const SPLITLING: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['........', '.oooooo.', '.odrrdo.', '.ommmmo.'],
    ['........', '.oooooo.', '.oddddo.', '.ommmmo.'],
  ],
};

/** Medicine wagon: patches up whoever is still standing. */
const HEALER: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['oo........oo', '.oooooooooo.', '.owwGGGGwwo.', '.owGGwwGGwo.', '.ommmmmmmmmo', '.odo.odo.od.'],
    ['.oo......oo.', '.oooooooooo.', '.owwGGGGwwo.', '.owGGwwGGwo.', '.ommmmmmmmmo', '.oodo.odo.od'],
  ],
};

/** Ambusher: flat in the scrub until the last second. */
const STEALTH: PixelArt = {
  palette: P,
  mirrorY: true,
  frames: [
    ['............', 'o...........', 'oggoo.......', '.ogggoooo...', '.oggGGGGGoo.', 'oggGGgggGGGo'],
    ['............', 'o...........', 'oggoo.......', '.ogggoooo...', '.oggGGGGGoo.', 'oggGGyrgGGGo'],
  ],
};

// Boss: an armored locomotive-cart. a = plate, A = highlight, s = shadow, t = barrel/stack,
// e = lamp, k/w = firebox glow.
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
    a: C.leather,
    A: C.sand,
    s: C.darkWood,
    t: C.outline,
    e: C.gold,
    k: C.rust,
    w: C.gold,
  },
};

export const WEST_ENEMY_ART: Record<EnemyArchetype, PixelArt> = {
  scout: SCOUT,
  armored: ARMORED,
  grunt: GRUNT,
  shielded: SHIELDED,
  splitter: SPLITTER,
  splitling: SPLITLING,
  healer: HEALER,
  stealth: STEALTH,
  // The Marshal Killer — black coat and silver.
  boss_1: BOSS_BASE,
  // Iron Horse — a plated locomotive.
  boss_2: recolor(BOSS_BASE, { a: C.slate, A: C.gunmetal, s: C.nightBlue, t: C.outline, e: C.gold, k: C.rust, w: C.gold }),
  // Gatling Wagon — brass and heat.
  boss_3: recolor(BOSS_BASE, { a: C.rust, A: C.gold, s: C.blood, t: C.darkWood, e: C.bone, k: C.gold, w: C.bone }),
  // Outlaw King — dusk purple, silver trim.
  boss_4: recolor(BOSS_BASE, { a: C.duskDark, A: C.dusk, s: C.outline, t: C.gunmetal, e: C.bone, k: C.dusk, w: C.bone }),
  // The Calamity — bone white and bloody.
  boss_5: recolor(BOSS_BASE, { a: C.bone, A: C.sand, s: C.leather, t: C.blood, e: C.rust, k: C.blood, w: C.rust }),
};
