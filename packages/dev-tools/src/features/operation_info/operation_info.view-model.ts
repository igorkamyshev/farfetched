import { combine, createEvent, createStore } from 'effector';

import { $queries, $queryConnections, $retries } from '../../services/storage';
import { $states } from '../../services/tracker';

const $activeId = createStore<string | null>(null);
export const $activeQuery = combine(
  { queries: $queries, activeId: $activeId },
  ({ queries, activeId }) =>
    queries.find((query) => query.id === activeId) ?? null
);

export const $operationInfoIsOpen = $activeId.map((id) => id !== null);

export const selectDeclaration = createEvent<string>();
export const unselectDeclaration = createEvent();

$activeId.on(selectDeclaration, (_, id) => id).reset(unselectDeclaration);

// -- Depedenant queries

export const $dependantQueries = combine(
  {
    queries: $queries,
    activeQuery: $activeQuery,
    queryConnections: $queryConnections,
  },
  ({ queries, activeQuery, queryConnections }) =>
    queries.filter((query) =>
      queryConnections.some(
        (connection) =>
          connection.fromId === activeQuery?.id && connection.toId === query.id
      )
    )
);

export const $dependOnQueries = combine(
  {
    queries: $queries,
    activeQuery: $activeQuery,
    queryConnections: $queryConnections,
  },
  ({ queries, activeQuery, queryConnections }) =>
    queries.filter((query) =>
      queryConnections.some(
        (connection) =>
          connection.toId === activeQuery?.id && connection.fromId === query.id
      )
    )
);

export const $retryInfo = combine(
  { activeQuery: $activeQuery, retries: $retries, states: $states },
  ({ activeQuery, retries, states }) =>
    retries
      .filter((retry) => retry.targetId === activeQuery?.id)
      .map((retry) => ({
        ...retry,
        info: retry.info.map((i) => ({
          name: i.name,
          value: states[i.storeId],
        })),
      }))
);
