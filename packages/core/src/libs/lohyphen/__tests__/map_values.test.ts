import { describe, test, expect } from 'vitest';

import { mapValues } from '../map_values';

describe('mapValues', () => {
  test('should map values', () => {
    expect(mapValues({ data: 1 }, (value) => value + 1)).toEqual({ data: 2 });
  });
});
