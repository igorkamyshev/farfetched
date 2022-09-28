import { sample } from 'effector';

import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import { normalizeStaticOrReactive, StaticOrReactive } from '../misc/sourced';
import { Mutation, MutationSymbol } from './type';
import { Contract } from '../contract/type';
import { createContractApplier } from '../contract/apply_contract';
import { InvalidDataError } from '../errors/type';

interface SharedMutationFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
}

function createHeadlessMutation<
  Params,
  Data,
  ContractData extends Data,
  Error
>({
  name,
  enabled,
  contract,
}: SharedMutationFactoryConfig & {
  contract: Contract<Data, ContractData>;
}): Mutation<Params, ContractData, Error | InvalidDataError> {
  const mutationName = name ?? 'unnamed';

  const applyContractFx = createContractApplier<Params, Data, ContractData>(
    contract
  );

  const operation = createRemoteOperation<
    Params,
    ContractData,
    Error | InvalidDataError,
    null
  >({
    name: mutationName,
    serialize: 'ignore',
    $enabled: normalizeStaticOrReactive(enabled ?? true).map(Boolean),
    kind: MutationSymbol,
    meta: null,
  });

  sample({
    clock: operation.start,
    filter: operation.$enabled,
    target: operation.__.executeFx,
  });

  sample({ clock: operation.__.executeFx.done, target: applyContractFx });
  sample({
    clock: operation.__.executeFx.fail,
    target: operation.finished.failure,
  });

  sample({
    clock: applyContractFx.done,
    fn: ({ params, result }) => ({ params: params.params, data: result }),
    target: operation.finished.success,
  });
  sample({
    clock: applyContractFx.fail,
    fn: ({ params, error }) => ({ params: params.params, error }),
    target: operation.finished.failure,
  });

  return operation;
}

export { type SharedMutationFactoryConfig, createHeadlessMutation };
