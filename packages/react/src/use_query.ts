import { type Query } from '@farfetched/core';
import { useUnit } from 'effector-react';

function useQuery<Params, Data, Error>(
  query: Query<Params, Data, Error>
): {
  data: Data | null;
  error: Error | null;
  stale: boolean;
  pending: boolean;
  start: (params: Params) => void;
};

function useQuery(query: Query<any, any, any>) {
  const [data, stale, error, pending, start] = useUnit([
    query.$data,
    query.$stale,
    query.$error,
    query.$pending,
    query.start,
  ]);

  return { data, stale, error, pending, start };
}

export { useQuery };
