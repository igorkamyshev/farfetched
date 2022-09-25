import { Effect, Event } from 'effector';
import { expectType } from 'tsd';

import { createMutation } from '../create_mutation';

params_data_from_handler: {
  const mutation = createMutation({
    handler: async (params: number) => params.toString(),
  });

  expectType<Event<number>>(mutation.start);
  expectType<Event<{ params: number; data: string }>>(
    mutation.finished.success
  );
}

params_data_error_from_effect: {
  const effect: Effect<number, string, boolean> = {} as any;

  const mutation = createMutation({
    effect,
  });

  expectType<Event<number>>(mutation.start);
  expectType<Event<{ params: number; data: string }>>(
    mutation.finished.success
  );
  expectType<Event<{ params: number; error: boolean }>>(
    mutation.finished.failure
  );
}
