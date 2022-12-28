import { describe, expect, test, vi } from 'vitest';

import { createMutation } from '../mutation/create_mutation';
import { createQuery } from '../query/create_query';

describe('@@unitShape protocol returns same object for every call', () => {
  test('query', () => {
    const query = createQuery({ handler: vi.fn() });

    expect(query['@@unitShape']()).toBe(query['@@unitShape']());
  });

  test('mutation', () => {
    const mutation = createMutation({ handler: vi.fn() });

    expect(mutation['@@unitShape']()).toBe(mutation['@@unitShape']());
  });
});
