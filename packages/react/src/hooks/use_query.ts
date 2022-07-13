import { type Query } from '@farfetched/core';
import { useUnit } from 'effector-react';

function useQuery<Data, Error>(
  query: Query<void, Data, Error>
): {
  data: Data | null;
  error: Error | null;
  pending: boolean;
  start: () => void;
};

function useQuery<Params, Data, Error>(
  query: Query<Params, Data, Error>
): {
  data: Data | null;
  error: Error | null;
  pending: boolean;
  start: (params: Params) => void;
};

function useQuery(query: Query<any, any, any>) {
  const [data, error, pending, start] = useUnit([
    query.$data,
    query.$error,
    query.$pending,
    query.start,
  ]);

  return { data, error, pending, start };
}

export { useQuery };
