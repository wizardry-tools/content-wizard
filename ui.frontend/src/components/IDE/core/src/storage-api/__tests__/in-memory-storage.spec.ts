// storage.test.ts

import {createInMemoryStorage} from '../in-memory-storage';

describe('InMemoryStorage', () => {
  let storage: ReturnType<typeof createInMemoryStorage>;

  beforeEach(() => {
    storage = createInMemoryStorage();
  });

  test('should store and retrieve an item', () => {
    storage.setItem('key', 'value');
    expect(storage.getItem('key')).toBe('value');
  });

  test('should return null for non-existent keys', () => {
    expect(storage.getItem('nonExistentKey')).toBeNull();
  });

  test('should remove an item', () => {
    storage.setItem('key', 'value');
    storage.removeItem('key');
    expect(storage.getItem('key')).toBeNull();
  });

  test('should clear all items', () => {
    storage.setItem('key1', 'value1');
    storage.setItem('key2', 'value2');
    storage.clear();
    expect(storage.getItem('key1')).toBeNull();
    expect(storage.getItem('key2')).toBeNull();
  });
});
