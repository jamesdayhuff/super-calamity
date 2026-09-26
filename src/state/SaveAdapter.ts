/**
 * Persistence boundary for progression. state/index.ts picks LocalStorageSaveAdapter where storage
 * exists and NoopSaveAdapter otherwise (private mode, node tests).
 */
export interface SaveAdapter {
  load(): unknown | null;
  save(data: unknown): void;
}

export class NoopSaveAdapter implements SaveAdapter {
  load(): null {
    return null;
  }
  save(_data: unknown): void {}
}

export class LocalStorageSaveAdapter implements SaveAdapter {
  constructor(private readonly key = 'super-calamity/progression') {}

  load(): unknown | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  save(data: unknown): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch {
      // Storage full or blocked — progression continues in memory.
    }
  }
}
