import type { WizardStorage } from '@/types';

export function createInMemoryStorage(): WizardStorage {
  const store: Record<string, string> = {};

  return {
    length: Object.keys(store).length,
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      for (const key in store) {
        if (key in store) {
          delete store[key];
        }
      }
    },
  };
}
