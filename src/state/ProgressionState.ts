import type { TowerArchetype } from '../balance/archetypes';
import { TOWER_ARCHETYPES } from '../balance/archetypes';
import { META } from '../balance/economy';
import type { MapDef } from '../balance/types';
import { getSkin } from '../skins/registry';
import { DEFAULT_SKIN } from '../skins/registry';
import { SKIN_IDS, type SkinId } from '../skins/types';
import { computeMetaPayout, type MetaPayout } from '../systems/Economy';
import { Emitter } from '../util/Emitter';
import { NoopSaveAdapter, type SaveAdapter } from './SaveAdapter';

export const PROGRESSION_VERSION = 2;

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

/** Per-skin progress. Each world has its own currency, unlocks and clears. */
export interface SkinProgress {
  metaCurrency: number;
  totalMetaEarned: number;
  unlockedTowers: TowerArchetype[];
  /** Towers whose level 3 has been unlocked. */
  unlockedTiers: TowerArchetype[];
  completedMaps: string[];
  /** Highest wave count cleared per map id. */
  bestWave: Record<string, number>;
}

/** The single serializable object holding all cross-run progression. */
export interface ProgressionData {
  version: number;
  activeSkin: SkinId;
  /** Volume and mute are global — they are a property of the player, not of a world. */
  settings: Settings;
  skins: Record<SkinId, SkinProgress>;
}

export function defaultSkinProgress(): SkinProgress {
  return {
    metaCurrency: 0,
    totalMetaEarned: 0,
    unlockedTowers: [...META.startingTowers],
    unlockedTiers: [],
    completedMaps: [],
    bestWave: {},
  };
}

export function defaultProgression(): ProgressionData {
  return {
    version: PROGRESSION_VERSION,
    activeSkin: DEFAULT_SKIN,
    settings: { musicVolume: 0.5, sfxVolume: 0.7, muted: false },
    skins: Object.fromEntries(SKIN_IDS.map((id) => [id, defaultSkinProgress()])) as Record<SkinId, SkinProgress>,
  };
}

const isTowerArchetype = (v: unknown): v is TowerArchetype =>
  typeof v === 'string' && (TOWER_ARCHETYPES as string[]).includes(v);
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const isSkinId = (v: unknown): v is SkinId => typeof v === 'string' && (SKIN_IDS as string[]).includes(v);

/**
 * Validate one skin's block. Map ids are checked against *that skin's* maps, never the active
 * skin's — otherwise loading under one world would wipe every other world's clears.
 */
function parseSkinProgress(raw: unknown, skinId: SkinId): SkinProgress {
  const d = defaultSkinProgress();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>;
  const mapIds = new Set(getSkin(skinId).maps.map((m) => m.id));

  const best: Record<string, number> = {};
  if (r.bestWave && typeof r.bestWave === 'object') {
    for (const [k, v] of Object.entries(r.bestWave as Record<string, unknown>)) {
      if (mapIds.has(k)) best[k] = Math.max(0, Math.floor(num(v, 0)));
    }
  }

  return {
    metaCurrency: Math.max(0, num(r.metaCurrency, 0)),
    totalMetaEarned: Math.max(0, num(r.totalMetaEarned, 0)),
    unlockedTowers: [
      ...new Set([...d.unlockedTowers, ...(Array.isArray(r.unlockedTowers) ? r.unlockedTowers.filter(isTowerArchetype) : [])]),
    ],
    unlockedTiers: Array.isArray(r.unlockedTiers) ? [...new Set(r.unlockedTiers.filter(isTowerArchetype))] : [],
    completedMaps: Array.isArray(r.completedMaps)
      ? [...new Set(r.completedMaps.filter((m): m is string => typeof m === 'string' && mapIds.has(m)))]
      : [],
    bestWave: best,
  };
}

/** Validate untrusted data (e.g. from storage) into a ProgressionData, filling gaps with defaults. */
export function parseProgression(raw: unknown): ProgressionData {
  const d = defaultProgression();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>;
  const s = (r.settings ?? {}) as Record<string, unknown>;

  // v1 was a single flat blob with no `skins` field — it can only have been the space world.
  const blocks = (r.skins && typeof r.skins === 'object' ? r.skins : { space: r }) as Record<string, unknown>;

  return {
    version: PROGRESSION_VERSION,
    activeSkin: isSkinId(r.activeSkin) ? r.activeSkin : DEFAULT_SKIN,
    settings: {
      musicVolume: clamp01(num(s.musicVolume, d.settings.musicVolume)),
      sfxVolume: clamp01(num(s.sfxVolume, d.settings.sfxVolume)),
      muted: typeof s.muted === 'boolean' ? s.muted : d.settings.muted,
    },
    skins: Object.fromEntries(SKIN_IDS.map((id) => [id, parseSkinProgress(blocks[id], id)])) as Record<
      SkinId,
      SkinProgress
    >,
  };
}

export class Progression {
  readonly events = new Emitter<{ change: [ProgressionData] }>();
  private state: ProgressionData;

  constructor(private readonly saver: SaveAdapter = new NoopSaveAdapter()) {
    const loaded = saver.load();
    this.state = loaded ? parseProgression(loaded) : defaultProgression();
  }

  get data(): Readonly<ProgressionData> {
    return this.state;
  }

  /** The active skin's block. Every unlock and clear below reads and writes through here. */
  get current(): SkinProgress {
    return this.state.skins[this.state.activeSkin];
  }

  get skinId(): SkinId {
    return this.state.activeSkin;
  }

  setSkin(id: SkinId): void {
    if (this.state.activeSkin === id) return;
    this.state.activeSkin = id;
    this.commit();
  }

  toJSON(): ProgressionData {
    return structuredClone(this.state);
  }

  load(raw: unknown): void {
    this.state = parseProgression(raw);
    this.commit();
  }

  /** Resets the active skin only. Other worlds keep their progress. */
  reset(): void {
    this.state.skins[this.state.activeSkin] = defaultSkinProgress();
    this.commit();
  }

  resetAll(): void {
    const activeSkin = this.state.activeSkin;
    this.state = { ...defaultProgression(), activeSkin, settings: this.state.settings };
    this.commit();
  }

  isTowerUnlocked(id: TowerArchetype): boolean {
    return this.current.unlockedTowers.includes(id);
  }

  isTierUnlocked(id: TowerArchetype): boolean {
    return this.current.unlockedTiers.includes(id);
  }

  /** Highest level this tower may be upgraded to in a run. */
  maxLevel(id: TowerArchetype): number {
    return this.isTierUnlocked(id) ? 3 : 2;
  }

  isMapUnlocked(index: number): boolean {
    if (index <= 0) return true;
    const prev = getSkin(this.state.activeSkin).maps[index - 1];
    return !!prev && this.current.completedMaps.includes(prev.id);
  }

  isMapCompleted(id: string): boolean {
    return this.current.completedMaps.includes(id);
  }

  unlockTower(id: TowerArchetype): boolean {
    const cost = META.towerUnlockCost[id];
    if (this.isTowerUnlocked(id) || this.current.metaCurrency < cost) return false;
    this.current.metaCurrency -= cost;
    this.current.unlockedTowers.push(id);
    this.commit();
    return true;
  }

  unlockTier(id: TowerArchetype): boolean {
    const cost = META.tierUnlockCost[id];
    if (!this.isTowerUnlocked(id) || this.isTierUnlocked(id) || this.current.metaCurrency < cost) return false;
    this.current.metaCurrency -= cost;
    this.current.unlockedTiers.push(id);
    this.commit();
    return true;
  }

  /** Apply the end-of-run meta payout and completion; returns the payout breakdown. */
  recordRun(map: MapDef, wavesCleared: number, victory: boolean): MetaPayout {
    const firstClear = victory && !this.isMapCompleted(map.id);
    const payout = computeMetaPayout(map, wavesCleared, victory, firstClear);
    const p = this.current;
    p.metaCurrency += payout.total;
    p.totalMetaEarned += payout.total;
    if (firstClear) p.completedMaps.push(map.id);
    p.bestWave[map.id] = Math.max(p.bestWave[map.id] ?? 0, wavesCleared);
    this.commit();
    return payout;
  }

  updateSettings(patch: Partial<Settings>): void {
    this.state.settings = { ...this.state.settings, ...patch };
    this.commit();
  }

  // ---- Debug helpers (dev builds only call these) ----
  addMeta(amount: number): void {
    this.current.metaCurrency += amount;
    this.commit();
  }

  unlockEverything(): void {
    const p = this.current;
    p.unlockedTowers = [...TOWER_ARCHETYPES];
    p.unlockedTiers = [...TOWER_ARCHETYPES];
    p.completedMaps = getSkin(this.state.activeSkin).maps.map((m) => m.id);
    this.commit();
  }

  private commit(): void {
    this.saver.save(this.toJSON());
    this.events.emit('change', this.state);
  }
}
