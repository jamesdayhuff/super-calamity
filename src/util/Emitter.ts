/** Minimal typed event emitter with no Phaser dependency (usable in pure state and tests). */
export class Emitter<E extends { [K in keyof E]: unknown[] }> {
  private handlers: { [K in keyof E]?: Array<(...args: E[K]) => void> } = {};

  on<K extends keyof E>(event: K, fn: (...args: E[K]) => void): () => void {
    (this.handlers[event] ??= []).push(fn);
    return () => this.off(event, fn);
  }

  off<K extends keyof E>(event: K, fn: (...args: E[K]) => void): void {
    const list = this.handlers[event];
    if (list) this.handlers[event] = list.filter((h) => h !== fn);
  }

  emit<K extends keyof E>(event: K, ...args: E[K]): void {
    for (const fn of this.handlers[event] ?? []) fn(...args);
  }

  clear(): void {
    this.handlers = {};
  }
}
