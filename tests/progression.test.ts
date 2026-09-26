import { describe, expect, it, vi } from 'vitest';
import { META } from '../src/balance/economy';
import { TOWER_STATS } from '../src/balance/towers';
import { getSkin } from '../src/skins/registry';
import {
  defaultProgression,
  parseProgression,
  Progression,
  PROGRESSION_VERSION,
} from '../src/state/ProgressionState';
import type { SaveAdapter } from '../src/state/SaveAdapter';
import { computeMetaPayout, sellValue, towerInvestment } from '../src/systems/Economy';

const SPACE = getSkin('space');
const MAPS = SPACE.maps;

describe('Progression', () => {
  it('starts with only the starting towers and map 1 unlocked', () => {
    const p = new Progression();
    expect(p.current.unlockedTowers).toEqual(META.startingTowers);
    expect(p.isMapUnlocked(0)).toBe(true);
    expect(p.isMapUnlocked(1)).toBe(false);
    expect(p.maxLevel('direct')).toBe(2);
  });

  it('unlocks towers and tiers only when affordable', () => {
    const p = new Progression();
    expect(p.unlockTower('antishield')).toBe(false);
    p.addMeta(META.towerUnlockCost.antishield);
    expect(p.unlockTier('antishield')).toBe(false); // tower must be unlocked first
    expect(p.unlockTower('antishield')).toBe(true);
    expect(p.current.metaCurrency).toBe(0);
    expect(p.unlockTower('antishield')).toBe(false); // already unlocked
    p.addMeta(META.tierUnlockCost.antishield);
    expect(p.unlockTier('antishield')).toBe(true);
    expect(p.maxLevel('antishield')).toBe(3);
  });

  it('pays first-clear bonus once, a reduced bonus on replays, and unlocks the next map', () => {
    const p = new Progression();
    const map = MAPS[0];
    const first = p.recordRun(map, map.waves.length, true);
    expect(first.firstClear).toBe(true);
    expect(first.total).toBe(map.waves.length * map.metaPerWave + map.firstClearBonus);
    expect(p.isMapUnlocked(1)).toBe(true);
    const replay = p.recordRun(map, map.waves.length, true);
    expect(replay.firstClear).toBe(false);
    expect(replay.clearBonus).toBeLessThan(map.firstClearBonus);
  });

  it('pays per-wave meta on defeat without completing the map', () => {
    const p = new Progression();
    const payout = p.recordRun(MAPS[0], 4, false);
    expect(payout.total).toBe(4 * MAPS[0].metaPerWave);
    expect(p.isMapUnlocked(1)).toBe(false);
    expect(p.current.bestWave[MAPS[0].id]).toBe(4);
  });

  it('round-trips through JSON without loss', () => {
    const p = new Progression();
    p.addMeta(200);
    p.unlockTower('sniper');
    p.recordRun(MAPS[0], 10, true);
    p.updateSettings({ muted: true, musicVolume: 0.2 });
    const json = JSON.parse(JSON.stringify(p.toJSON()));
    const q = new Progression();
    q.load(json);
    expect(q.toJSON()).toEqual(p.toJSON());
  });

  it('toJSON returns a detached copy', () => {
    const p = new Progression();
    const snap = p.toJSON();
    snap.skins.space.unlockedTowers.push('support');
    expect(p.isTowerUnlocked('support')).toBe(false);
  });

  it('parses garbage into defaults and filters unknown ids', () => {
    expect(parseProgression(null)).toEqual(defaultProgression());
    const parsed = parseProgression({
      skins: { space: { metaCurrency: -5, unlockedTowers: ['bogus', 'chain'], completedMaps: ['nope'] } },
    });
    expect(parsed.skins.space.metaCurrency).toBe(0);
    expect(parsed.skins.space.unlockedTowers).toContain('chain');
    expect(parsed.skins.space.unlockedTowers).not.toContain('bogus');
    expect(parsed.skins.space.completedMaps).toEqual([]);
  });

  it('writes through the save adapter on every change', () => {
    const saver: SaveAdapter = { load: () => ({ skins: { space: { metaCurrency: 7 } } }), save: vi.fn() };
    const p = new Progression(saver);
    expect(p.current.metaCurrency).toBe(7);
    p.addMeta(1);
    expect(saver.save).toHaveBeenCalledWith(
      expect.objectContaining({ skins: expect.objectContaining({ space: expect.objectContaining({ metaCurrency: 8 }) }) }),
    );
  });
});

describe('per-skin isolation', () => {
  it('unlocks in one world do not leak into another', () => {
    const p = new Progression();
    p.addMeta(META.towerUnlockCost.sniper);
    expect(p.unlockTower('sniper')).toBe(true);
    expect(p.isTowerUnlocked('sniper')).toBe(true);

    p.setSkin('ww2');
    expect(p.isTowerUnlocked('sniper')).toBe(false);
    expect(p.current.metaCurrency).toBe(0);
    expect(p.current.unlockedTowers).toEqual(META.startingTowers);

    p.setSkin('space');
    expect(p.isTowerUnlocked('sniper')).toBe(true);
  });

  it('clears are tracked per world', () => {
    const p = new Progression();
    p.recordRun(MAPS[0], MAPS[0].waves.length, true);
    expect(p.isMapCompleted(MAPS[0].id)).toBe(true);
    p.setSkin('west');
    expect(p.current.completedMaps).toEqual([]);
    expect(p.isMapUnlocked(1)).toBe(false);
  });

  it('settings are global, not per world', () => {
    const p = new Progression();
    p.updateSettings({ muted: true, sfxVolume: 0.3 });
    p.setSkin('ww2');
    expect(p.data.settings.muted).toBe(true);
    expect(p.data.settings.sfxVolume).toBe(0.3);
  });

  it('reset clears only the active world', () => {
    const p = new Progression();
    p.addMeta(50);
    p.setSkin('ww2');
    p.addMeta(70);
    p.reset();
    expect(p.current.metaCurrency).toBe(0);
    p.setSkin('space');
    expect(p.current.metaCurrency).toBe(50);
  });
});

describe('save migration', () => {
  it('folds a v1 flat blob into the space world', () => {
    const v1 = {
      version: 1,
      metaCurrency: 120,
      totalMetaEarned: 300,
      unlockedTowers: ['direct', 'splash', 'slow', 'sniper'],
      unlockedTiers: ['direct'],
      completedMaps: [MAPS[0].id, MAPS[1].id],
      bestWave: { [MAPS[0].id]: 10 },
      settings: { musicVolume: 0.2, sfxVolume: 0.9, muted: true },
    };
    const parsed = parseProgression(v1);

    expect(parsed.version).toBe(PROGRESSION_VERSION);
    expect(parsed.activeSkin).toBe('space');
    expect(parsed.settings).toEqual(v1.settings);
    expect(parsed.skins.space.metaCurrency).toBe(120);
    expect(parsed.skins.space.unlockedTowers).toContain('sniper');
    expect(parsed.skins.space.unlockedTiers).toEqual(['direct']);
    expect(parsed.skins.space.completedMaps).toEqual([MAPS[0].id, MAPS[1].id]);
    expect(parsed.skins.space.bestWave[MAPS[0].id]).toBe(10);

    // The other worlds start fresh rather than inheriting the old run.
    expect(parsed.skins.ww2.metaCurrency).toBe(0);
    expect(parsed.skins.west.completedMaps).toEqual([]);
  });

  it('validates each world against its own maps, never the active one', () => {
    const ww2Maps = getSkin('ww2').maps;
    const parsed = parseProgression({
      version: 2,
      activeSkin: 'ww2',
      skins: {
        space: { completedMaps: [MAPS[0].id] },
        ww2: { completedMaps: [ww2Maps[0].id] },
      },
    });
    expect(parsed.skins.space.completedMaps).toEqual([MAPS[0].id]);
    expect(parsed.skins.ww2.completedMaps).toEqual([ww2Maps[0].id]);
  });
});

describe('Economy', () => {
  it('computes payouts', () => {
    expect(computeMetaPayout({ metaPerWave: 2, firstClearBonus: 20 }, 10, true, true).total).toBe(40);
    expect(computeMetaPayout({ metaPerWave: 2, firstClearBonus: 20 }, 3, false, false).total).toBe(6);
  });

  it('computes investment and sell value', () => {
    const direct = TOWER_STATS.direct;
    expect(towerInvestment(direct, 2)).toBe(direct.levels[0].cost + direct.levels[1].cost);
    expect(sellValue(100)).toBe(70);
  });
});
