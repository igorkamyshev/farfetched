import { createEvent } from 'effector';
import { describe, test } from 'vitest';

import { Query } from '../../query/type';
import { keepFresh } from '../keep_fresh';

describe('keepFresh', () => {
  describe('auto', () => {
    test('accepts Query with void params', () => {
      const query: Query<void, unknown, unknown> = {} as any;

      keepFresh(query);
    });

    test('accept Query with non-void params', () => {
      const query: Query<number, unknown, unknown> = {} as any;

      keepFresh(query);
    });
  });

  describe('manual', () => {
    test('accepts Query with void params', () => {
      const triggers = [createEvent()];
      const query: Query<void, unknown, unknown> = {} as any;

      keepFresh(query, { triggers });
    });

    test('accept Query with non-void params', () => {
      const triggers = [createEvent()];
      const query: Query<number, unknown, unknown> = {} as any;

      keepFresh(query, { triggers });
    });
  });
});
