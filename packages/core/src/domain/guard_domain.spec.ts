import { createDomain } from 'effector';
import { describe, expect, test, vi } from 'vitest';

import { createMutation } from '../mutation/create_mutation';
import { createQuery } from '../query/create_query';
import { toInternalDomain } from './guard_domain';
import { internalDomainSymbol } from './type';

describe('toInternalDomain', () => {
  test('put Query to history', () => {
    const domain = createDomain();
    const internal = toInternalDomain(domain)[internalDomainSymbol];

    const listenerBeforeCreation = vi.fn();
    internal.onQueryCreated(listenerBeforeCreation);

    const query = createQuery({ handler: async () => null, domain });

    const listenerAfterCreation = vi.fn();
    internal.onQueryCreated(listenerAfterCreation);

    expect(internal.history.queries).toEqual([query]);

    expect(listenerAfterCreation).toBeCalledTimes(1);
    expect(listenerAfterCreation).toHaveBeenCalledWith(query);

    expect(listenerBeforeCreation).toBeCalledTimes(1);
    expect(listenerBeforeCreation).toHaveBeenCalledWith(query);
  });

  test('put Mutation to history', () => {
    const domain = createDomain();
    const internal = toInternalDomain(domain)[internalDomainSymbol];

    const listenerBeforeCreation = vi.fn();
    internal.onMutationCreated(listenerBeforeCreation);

    const mutation = createMutation({ handler: async () => null, domain });

    const listenerAfterCreation = vi.fn();
    internal.onMutationCreated(listenerAfterCreation);

    expect(internal.history.mutations).toEqual([mutation]);

    expect(listenerAfterCreation).toBeCalledTimes(1);
    expect(listenerAfterCreation).toHaveBeenCalledWith(mutation);

    expect(listenerBeforeCreation).toBeCalledTimes(1);
    expect(listenerBeforeCreation).toHaveBeenCalledWith(mutation);
  });
});
