import { describe, expectTypeOf, test } from 'vitest';
import { createStore, type Effect, type Event } from 'effector';

import { type Query } from '../../query/type';
import { type Mutation } from '../../mutation/type';
import { createBarrier } from '../create_barrier';

describe('createBarrier', () => {
  describe('overload active', () => {
    test('accept store as active', () => {
      const barrier = createBarrier({ active: createStore(true) });
    });

    test('accept Query as performer', () => {
      const voidQuery: Query<void, unknown, unknown, unknown> = {} as any;
      const paramsQuery: Query<{ id: number }, unknown, unknown, unknown> =
        {} as any;

      // void Query is allowed
      const barrier1 = createBarrier({
        active: createStore(true),
        perform: [voidQuery],
      });

      const barrier2 = createBarrier({
        active: createStore(true),
        // @ts-expect-error Query with params is not allowed
        perform: [paramsQuery],
      });
    });

    test('accept Mutation as performer', () => {
      const voidMutation: Mutation<void, unknown, unknown> = {} as any;
      const paramsMutation: Mutation<{ id: number }, unknown, unknown> =
        {} as any;

      // void Mutation is allowed
      const barrier1 = createBarrier({
        active: createStore(true),
        perform: [voidMutation],
      });

      const barrier2 = createBarrier({
        active: createStore(true),
        // @ts-expect-error Mutation with params is not allowed
        perform: [paramsMutation],
      });
    });

    test('accept Effect as performer', () => {
      const voidEffect: Effect<void, unknown, unknown> = {} as any;
      const paramsEffect: Effect<{ id: number }, unknown, unknown> = {} as any;

      // void Effect is allowed
      const barrier1 = createBarrier({
        active: createStore(true),
        perform: [voidEffect],
      });

      const barrier2 = createBarrier({
        active: createStore(true),
        // @ts-expect-error Effect with params is not allowed
        perform: [paramsEffect],
      });
    });

    test('accept start/end Events as performer', () => {
      const voidEvent: Event<void> = {} as any;
      const paramsEvent: Event<{ id: number }> = {} as any;

      // void Event as start is allowed
      // any Event as end is allowed
      const barrier1 = createBarrier({
        active: createStore(true),
        perform: [
          { start: voidEvent, end: paramsEvent },
          { start: voidEvent, end: voidEvent },
        ],
      });

      const barrier2 = createBarrier({
        active: createStore(true),
        perform: [
          // @ts-expect-error Event with params is not allowed as start
          { start: paramsEvent, end: paramsEvent },
          // @ts-expect-error Event with params is not allowed as start
          { start: paramsEvent, end: voidEvent },
        ],
      });
    });
  });

  describe('overload activateOn only', () => {
    test('activateOn.failure accepts { params, error } and return boolean', () => {
      const barrier1 = createBarrier({
        activateOn: {
          failure: ({ params, error }) => {
            expectTypeOf(params).toEqualTypeOf<unknown>();
            expectTypeOf(error).toEqualTypeOf<unknown>();
            return true;
          },
        },
        perform: [],
      });

      const barrier2 = createBarrier({
        activateOn: {
          // @ts-expect-error return type is not boolean
          failure: ({ params, error }) => {
            return 's';
          },
        },
        perform: [],
      });
    });

    test('activateOn.success accepts { params, result } and return boolean', () => {
      const barrier1 = createBarrier({
        activateOn: {
          success: ({ params, result }) => {
            expectTypeOf(params).toEqualTypeOf<unknown>();
            expectTypeOf(result).toEqualTypeOf<unknown>();
            return true;
          },
        },
        perform: [],
      });

      const barrier2 = createBarrier({
        activateOn: {
          // @ts-expect-error return type is not boolean
          success: ({ params, result }) => {
            return 's';
          },
        },
        perform: [],
      });
    });
  });

  describe('overload activateOn/deactivateOn', () => {
    test('accept any events as activateOn/deactivateOn', () => {
      const voidEvent: Event<void> = {} as any;
      const paramsEvent: Event<{ id: number }> = {} as any;

      const barrier1 = createBarrier({
        activateOn: voidEvent,
        deactivateOn: voidEvent,
      });
      const barrier2 = createBarrier({
        activateOn: voidEvent,
        deactivateOn: paramsEvent,
      });
      const barrier3 = createBarrier({
        activateOn: paramsEvent,
        deactivateOn: voidEvent,
      });
      const barrier4 = createBarrier({
        activateOn: paramsEvent,
        deactivateOn: paramsEvent,
      });
    });
  });
});
