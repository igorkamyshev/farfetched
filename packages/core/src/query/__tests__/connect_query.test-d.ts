import { createStore, Store, attach, Effect } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { createQuery } from '../create_query';
import { connectQuery } from '../connect_query';

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
      target: getAnotherQuery,
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
    });
  });

  test('wants fn when not voidtarget', () => {
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
});
