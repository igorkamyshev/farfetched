import { describe, test, expect } from 'vitest';

import { inMemoryCache } from '../in_memory';
import { localStorageCache } from '../local_storage';
import { sessionStorageCache } from '../session_storage';

describe.each([
  { name: 'inMemory', adapter: inMemoryCache },
  { name: 'sessionSotrage', adapter: sessionStorageCache },
  { name: 'localStorage', adapter: localStorageCache },
])('adapter $name', ({ adapter }) => {
  test('save and get', async () => {
    expect(() => adapter()).not.toThrow();
  });
});
