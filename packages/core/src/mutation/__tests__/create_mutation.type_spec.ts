import { Event } from 'effector';
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
