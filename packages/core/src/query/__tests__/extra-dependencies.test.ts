import { createStore } from "effector";
import { describe, test, expect } from 'vitest';

import { normalizeExtraDependencies } from "../extra-dependencies";

describe('normalizeExtraDependencies', () => {
  test('should return empty array if no extraDependencies', async () => {
    const result = normalizeExtraDependencies();
    expect(result).toEqual([]);
  });

  test('should return empty array if extraDependencies is empty array', async () => {
    const result = normalizeExtraDependencies([]);
    expect(result).toEqual([]);
  });

  test('should return array with one item if extraDependencies is store', async () => {
    const $dependency = createStore(42);
    const result = normalizeExtraDependencies($dependency);
    expect(result).toEqual([$dependency]);
  });

   test('should return array if extraDependencies is array with stores', async () => {
    const $dependency1 = createStore(42);
    const $dependency2 = createStore(24);
    const result = normalizeExtraDependencies([$dependency1, $dependency2]);

    expect(result).toEqual([$dependency1, $dependency2]);
   });
})
