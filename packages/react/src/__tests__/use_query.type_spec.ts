import { Query } from '@farfetched/core';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

import { useQuery } from '../use_query';

function ComponentVoidStart() {
  const { data, error, pending, start } = useQuery(
    {} as Query<void, number, string>
  );

  expectAssignable<() => void>(start);
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
  expectNotAssignable<() => void>(start);
  expectType<number | null>(data);
  expectType<string | null>(error);
  expectType<boolean>(pending);

  return null;
}

function ComponentVoidStartWithInitialData() {
  const { data, error, pending, start } = useQuery(
    {} as Query<void, number, string, number>
  );

  expectAssignable<() => void>(start);
  expectType<number>(data);
  expectType<string | null>(error);
  expectType<boolean>(pending);

  return null;
}

function ComponentStartWithInitialData() {
  const { data, error, pending, start } = useQuery(
    {} as Query<{ limit: string }, number, string, number>
  );

  expectType<(params: { limit: string }) => void>(start);
  expectNotAssignable<() => void>(start);
  expectType<number>(data);
  expectType<string | null>(error);
  expectType<boolean>(pending);

  return null;
}
