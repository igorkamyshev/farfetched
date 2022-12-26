import { Mutation } from '@farfetched/core';
import { useUnit } from 'effector-solid';
import { Accessor } from 'solid-js';

/**
 * @deprecated Use `useUnit` from 'effector-solid` instead
 */
function useMutation(mutation: Mutation<void, any, any>): {
  start: () => void;
  pending: Accessor<boolean>;
};

/**
 * @deprecated Use `useUnit` from 'effector-solid` instead
 */
function useMutation<P>(mutation: Mutation<P, any, any>): {
  start: (params: P) => void;
  pending: Accessor<boolean>;
};

/**
 * @deprecated Use `useUnit` from 'effector-solid` instead
 */
function useMutation<P>(mutation: Mutation<P, any, any>) {
  const [start, pending] = useUnit([mutation.start, mutation.$pending]);

  return { start, pending };
}

export { useMutation };
