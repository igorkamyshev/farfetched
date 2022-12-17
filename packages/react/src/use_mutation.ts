import { Mutation } from '@farfetched/core';
import { useUnit } from 'effector-react';

/**
 * @deprecated Use `useUnit` from 'effector-react` instead
 */
function useMutation(mutation: Mutation<void, any, any>): {
  start: () => void;
  pending: boolean;
};

/**
 * @deprecated Use `useUnit` from 'effector-react` instead
 */
function useMutation<P>(mutation: Mutation<P, any, any>): {
  start: (params: P) => void;
  pending: boolean;
};

/**
 * @deprecated Use `useUnit` from 'effector-react` instead
 */
function useMutation<P>(mutation: Mutation<P, any, any>) {
  const [start, pending] = useUnit([mutation.start, mutation.$pending]);

  return { start, pending };
}

export { useMutation };
