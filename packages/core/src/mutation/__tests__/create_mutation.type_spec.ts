import { Effect, Event } from 'effector';
import { expectType } from 'tsd';
import { Contract } from '../../contract/type';
import { InvalidDataError } from '../../errors/type';

import { createMutation } from '../create_mutation';

params_data_from_handler: {
  const mutation = createMutation({
    handler: async (params: number) => params.toString(),
  });

  expectType<Event<number>>(mutation.start);
  expectType<Event<{ params: number; data: string; meta: any }>>(
    mutation.finished.success
  );
}

params_data_error_from_effect: {
  const effect: Effect<number, string, boolean> = {} as any;

  const mutation = createMutation({
    effect,
  });

  expectType<Event<number>>(mutation.start);
  expectType<Event<{ params: number; data: string; meta: any }>>(
    mutation.finished.success
  );
  expectType<Event<{ params: number; error: boolean; meta: any }>>(
    mutation.finished.failure
  );
}

effect_and_contract: {
  const effect: Effect<number, unknown, boolean> = {} as any;
  const contract: Contract<unknown, string> = {} as any;

  const mutation = createMutation({ effect, contract });
  expectType<Event<{ params: number; data: string; meta: any }>>(
    mutation.finished.success
  );
  expectType<
    Event<{ params: number; error: boolean | InvalidDataError; meta: any }>
  >(mutation.finished.failure);
}
