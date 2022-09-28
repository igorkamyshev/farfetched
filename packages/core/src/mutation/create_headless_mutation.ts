import { sample } from 'effector';

import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import { normalizeStaticOrReactive, StaticOrReactive } from '../misc/sourced';
import { Mutation, MutationSymbol } from './type';

interface SharedMutationFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
}

function createHeadlessMutation<Params, Data, Error>({
  name,
  enabled,
}: SharedMutationFactoryConfig): Mutation<Params, Data, Error> {
  const mutationName = name ?? 'unnamed';

  const operation = createRemoteOperation<Params, Data, Error, null>({
    name: mutationName,
    serialize: 'ignore',
    $enabled: normalizeStaticOrReactive(enabled ?? true).map(Boolean),
    kind: MutationSymbol,
    meta: null,
  });

  sample({ clock: operation.start, target: operation.__.executeFx });
  sample({
    clock: operation.__.executeFx.done,
    fn: ({ params, result }) => ({ params, data: result }),
    target: operation.finished.success,
  });

  return operation;
}

export { type SharedMutationFactoryConfig, createHeadlessMutation };
