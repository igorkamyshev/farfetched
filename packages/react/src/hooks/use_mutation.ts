import { Mutation } from '@farfetched/core';
import { useUnit } from 'effector-react';

function useMutation(mutation: Mutation<void, any, any>): { start: () => void };
function useMutation<P>(mutation: Mutation<P, any, any>): {
  start: (params: P) => void;
};

function useMutation<P>(mutation: Mutation<P, any, any>) {
  const [start] = useUnit([mutation.start]);

  return { start };
}

export { useMutation };
