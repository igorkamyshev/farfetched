import { createEvent, createStore } from 'effector';
import { describe, test } from 'vitest';

import { Query } from '../../query/type';
import { keepFresh } from '../keep_fresh';

describe('keepFresh', () => {
  describe('auto', () => {
    describe('no params', () => {
      test('accepts Query with void params', () => {
        const setup = createEvent();
        const query: Query<void, unknown, unknown> = {} as any;

        keepFresh(query, { setup });
      });

      test('does not accept Query with non-void params', () => {
        const setup = createEvent();
        const query: Query<number, unknown, unknown> = {} as any;

        // @ts-expect-error Type 'number' is not assignable to type 'void'.
        keepFresh(query, { setup });
      });
    });

    describe('with params', () => {
      test('requires Query with non-void params with params as non-void Store', () => {
        const setup = createEvent();
        const query: Query<number, unknown, unknown> = {} as any;

        const $params = createStore(0);
        const $language = createStore('en');

        keepFresh(query, { setup, params: $params });

        // @ts-expect-error Type 'Store<string>' is not assignable to type 'Store<number>'.
        keepFresh(query, { setup, params: $language });
      });

      test('does not accept Query with void params with params as non-void Store', () => {
        const setup = createEvent();
        const query: Query<void, unknown, unknown> = {} as any;

        const $params = createStore(0);

        // @ts-expect-error Type 'Store<number>' is not assignable to type void.
        keepFresh(query, { setup, params: $params });
      });
    });
  });

  describe('manual', () => {
    describe('no params', () => {
      test('accepts Query with void params', () => {
        const triggers = [createEvent()];
        const query: Query<void, unknown, unknown> = {} as any;

        keepFresh(query, { triggers });
      });

      test('does not accept Query with non-void params', () => {
        const triggers = [createEvent()];
        const query: Query<number, unknown, unknown> = {} as any;

        // @ts-expect-error Type 'number' is not assignable to type 'void'.
        keepFresh(query, { triggers });
      });
    });

    describe('with params', () => {
      test('requires Query with non-void params with params as non-void Store', () => {
        const triggers = [createEvent()];
        const query: Query<number, unknown, unknown> = {} as any;

        const $params = createStore(0);
        const $language = createStore('en');

        keepFresh(query, { triggers, params: $params });

        // @ts-expect-error Type 'Store<string>' is not assignable to type 'Store<number>'.
        keepFresh(query, { triggers, params: $language });
      });

      test('requires Query with non-void params with params as function of payload', () => {
        const triggers = [createEvent<number>()];
        const query: Query<number, unknown, unknown> = {} as any;

        keepFresh(query, { triggers, params: (v: number) => v });

        // @ts-expect-error Type 'string' is not assignable to type 'number'.
        keepFresh(query, { triggers, params: (v: number) => v.toString() });

        // @ts-expect-error Type 'string' is not assignable to type 'number'.
        keepFresh(query, { triggers, params: (v: string) => v });
      });
    });
  });
});
