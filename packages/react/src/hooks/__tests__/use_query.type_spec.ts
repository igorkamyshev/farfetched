import { Query } from '@farfetched/core';
import { expectType } from 'tsd';

import { useQuery } from '../use_query';

function ComponentVoidStart() {
  const { data, error, pending, start } = useQuery(
    {} as Query<void, number, string>
  );

  expectType<() => void>(start);
  expectType<number | null>(data);
  expectType<string | null>(error);
  expectType<boolean>(pending);

  return null;
}

function ComponentStart() {
  const { data, error, pending, start } = useQuery(
    {} as Query<{ limit: string }, number, string>
  );

  expectType<(params: { limit: string }) => void>(start);
  expectType<number | null>(data);
  expectType<string | null>(error);
  expectType<boolean>(pending);

  return null;
}
