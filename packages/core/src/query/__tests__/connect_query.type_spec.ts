/*
-------- PREPARE ------
*/
import { Array, Number, Record, Static, String, Runtype } from 'runtypes';
import { createStore, Store, attach, Effect } from 'effector';
import { expectType, expectError } from 'tsd';
import { createQuery } from '../create_query';
import { connectQuery } from '../connect_query';
import { createMutation } from '../../mutation/create_mutation';

interface InvokeArgs {
  [key: string]: unknown;
}

declare function invoke<T>(cmd: string, args?: InvokeArgs): Promise<T>;

incorrect_source_inference_with_complex_types: {
  const Item = Record({
    id: Number,
    name: String,
    hours: Number,
  }).asReadonly();

  const ItemCrud = Item.omit('id');

  const Items = Array(Item).asReadonly();

  type ItemCrudT = Static<typeof ItemCrud>;
  type ItemsT = Static<typeof Items>;

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
        return invoke(command, params);
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
      expectType<ItemsT>(sources);
      return {
        params: {
          id: sources[0].id,
        },
      };
    },
  });
}

wants_fn_when_not_void_target: {
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
    handler: async ({ id, name }: { id: number; name: string }) => ({
      success: 'result',
    }),
  });

  expectError(
    connectQuery({
      source: {
        query1,
        query2,
      },
      target: queryTarget,
    })
  );
}
