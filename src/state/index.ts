import { Progression } from './ProgressionState';
import { LocalStorageSaveAdapter, NoopSaveAdapter } from './SaveAdapter';

/**
 * Session-wide progression store. Persisted to localStorage so each world's unlocks survive a
 * reload; falls back to memory-only where storage is unavailable (private mode, tests).
 */
const adapter = typeof localStorage === 'undefined' ? new NoopSaveAdapter() : new LocalStorageSaveAdapter();

export const progression = new Progression(adapter);
