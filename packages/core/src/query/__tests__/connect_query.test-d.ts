import { createStore, Store, attach, Effect, createEffect } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { createQuery } from '../create_query';
import { connectQuery } from '../connect_query';
import { Query } from '../type';

describe('connectQuery', () => {
  test('correct source inference with complex types', () => {
    type ItemCrudT = {
      readonly name: string;
      readonly hours: number;
    };
    type ItemsT = readonly {
      readonly id: number;
      readonly name: string;
      readonly hours: number;
    }[];

    interface AddItemCommand {
      command: 'add_item';
      params: {
        item: ItemCrudT;
      };
      result: void;
    }

    interface GetItemsCommand {
      command: 'get_items';
      params?: never;
      result: ItemsT;
    }

    interface GetAnotherCommand {
      command: 'get_another';
      params: {
        id: number;
      };
      result: ItemsT;
    }

    interface Command {
      getItems: GetItemsCommand;
      addItem: AddItemCommand;
      getAnother: GetAnotherCommand;
    }

    type Commands = {
      [K in keyof Command]: K;
    };

    const $commands = createStore({} as Commands);

    const invokeFx = <C extends keyof Command>($command: Store<C>) => {
      type CommandResolved = Command[C];
      type EffectParams = CommandResolved extends {
        params: infer P;
      }
        ? P
        : CommandResolved extends {
              params?: infer P;
            }
          ? never extends P
            ? void
            : P | void
          : never;

      return attach({
        source: $command,
        effect(command, params?: Command[C]['params']) {
          return params!;
        },
      }) as unknown as Effect<EffectParams, Command[C]['result']>;
    };

    const invokeQuery = <C extends keyof Command>($command: Store<C>) => {
      return createQuery({
        effect: invokeFx($command),
      });
    };

    const getItemsQuery = invokeQuery($commands.map((c) => c.getItems));

    const getAnotherQuery = invokeQuery($commands.map((c) => c.getAnother));

    /*
    -------- REPRODUCTION ------
    */
    connectQuery({
      source: getItemsQuery,
      fn(sources) {
        expectTypeOf(sources.result).toEqualTypeOf<ItemsT>();
        // @ts-expect-error invalid type
        expectTypeOf(sources.result).toEqualTypeOf<number>();

        return {
          params: {
            id: sources.result[0].id,
          },
        };
      },
      target: getAnotherQuery,
    });
  });

  test('wants fn when not void target', () => {
    const query1 = createQuery({
      handler: async (_: void) => ({
        id: 1,
      }),
    });

    const query2 = createQuery({
      handler: async (_: void) => ({
        name: 'item',
      }),
    });

    const queryTarget = createQuery({
      handler: async (params: { id: number; name: string }) => ({
        success: 'result',
      }),
    });

    // @ts-expect-error fn is required
    connectQuery({
      source: {
        query1,
        query2,
      },
      target: queryTarget,
    });
  });

  test('passes params types from source queries', () => {
    const languageQuery = {} as Query<string[], string, unknown>;
    const countryQuery = {} as Query<number[], string[], unknown>;

    const someTargetQuery = {} as Query<unknown, unknown, unknown>;

    connectQuery({
      source: {
        language: languageQuery,
        country: countryQuery,
      },
      fn: ({ language, country }) => {
        expectTypeOf(language.params).toEqualTypeOf<string[]>();
        expectTypeOf(language.result).toEqualTypeOf<string>();

        expectTypeOf(country.params).toEqualTypeOf<number[]>();
        expectTypeOf(country.result).toEqualTypeOf<string[]>();

        return { params: null as unknown };
      },
      target: someTargetQuery,
    });
  });

  test('passes params types from single source query', () => {
    const languageQuery = {} as Query<string[], string, unknown>;

    const someTargetQuery = {} as Query<unknown, unknown, unknown>;

    connectQuery({
      source: languageQuery,
      fn: (language) => {
        expectTypeOf(language.params).toEqualTypeOf<string[]>();
        expectTypeOf(language.result).toEqualTypeOf<string>();

        return { params: null as unknown };
      },
      target: someTargetQuery,
    });
  });

  test('does not require fn for void tarte Query', () => {
    const languageQuery = {} as Query<unknown, unknown, unknown>;

    const someTargetQuery = {} as Query<void, unknown, unknown>;

    connectQuery({
      source: languageQuery,
      target: someTargetQuery,
    });

    connectQuery({
      source: languageQuery,
      // @ts-expect-error fn does not exist for void query in target
      fn: () => ({ params: 1 }),
      target: someTargetQuery,
    });
  });

  test('does not require fn for void start Query created with handler, issue #443', () => {
    const refPageQuery = createQuery({
      name: 'refPageQuery',
      handler: async () => ({}) as any,
    });

    const createRefQuery = createQuery({
      name: 'createRefQuery',
      handler: async () => ({}) as any,
    });

    connectQuery({
      source: createRefQuery,
      target: refPageQuery,
    });
  });

  test('can use query with initialData', () => {
    type Query1Data = { foo: string };
    type Query2Data = { bar: string };

    const query1 = createQuery({
      effect: createEffect((): Query1Data => ({ foo: 'foo' })),
    });

    const query2 = createQuery({
      initialData: { bar: '42' } as Query2Data,
      effect: createEffect((): Query2Data => ({ bar: 'bar' })),
    });

    connectQuery({
      source: query1,
      target: query2,
    });
  });
});
