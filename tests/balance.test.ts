import { describe, expect, it } from 'vitest';
import { BOT_PLANS, simulateMap } from '../src/sim/bot';
import { getSkin } from '../src/skins/registry';
import { SKIN_IDS } from '../src/skins/types';

// Balance guard: a simple reference bot (see src/sim/bot.ts) must be able to clear every map in every
// world with the tower kit a player would plausibly have by then. Mechanics are shared across skins,
// so BOT_PLANS is indexed by map slot; only the layouts differ.
describe.each(SKIN_IDS)('balance (reference bot): %s', (skinId) => {
  const s = getSkin(skinId);
  const results = s.maps.map((map, i) => simulateMap(map, BOT_PLANS[i], 1 / 30, s));
  const describeResult = (r: (typeof results)[number]) => {
    const leaked = r.leakedIds.flatMap((ids, i) => (ids.length ? [`w${i + 1}:${ids.join('+')}`] : [])).join(' ');
    return `${r.map}: ${r.victory ? 'WIN' : 'LOSS'} hp=${r.hp} cleared=${r.wavesCleared}/${r.totalWaves} towers=${r.towers} hp/wave=[${r.hpByWave.join(',')}] leaked=[${leaked}]`;
  };

  it('prints a summary', () => {
    for (const r of results) console.log(describeResult(r));
  });

  results.forEach((r) => {
    it(`${r.map} is beatable by the reference bot`, () => {
      expect(r.victory, describeResult(r)).toBe(true);
    });
  });
});
