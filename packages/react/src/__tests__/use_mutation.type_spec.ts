import { Mutation } from '@farfetched/core';
import { expectType } from 'tsd';
import { useMutation } from '../use_mutation';

const mutationWithParams: Mutation<{ foo: string }, any, any> = null as any;

function ComponentWithParams() {
  const { start } = useMutation(mutationWithParams);

  expectType<(params: { foo: string }) => void>(start);
}

const mutationWithoutParams: Mutation<void, any, any> = null as any;

function ComponentWithoutParams() {
  const { start } = useMutation(mutationWithoutParams);

  expectType<() => void>(start);
}
