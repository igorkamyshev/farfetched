import { combine, createEvent, createStore } from 'effector';

// -- Search

export const $querySearch = createStore('');
export const querySearchChanged = createEvent<string>();

$querySearch.on(querySearchChanged, (_, newValue) => newValue);

// -- List

const $allQueries = createStore<Array<{ name: string; type: 'query' }>>([]);
export const declareQueries = createEvent<Array<{ name: string }>>();

$allQueries.on(declareQueries, (_, newQueries) =>
  newQueries.map((q) => ({ ...q, type: 'query' }))
);

export const $queries = combine(
  { all: $allQueries, search: $querySearch },
  ({ all, search }) => {
    if (search === '') {
      return all;
    }

    return all.filter((q) =>
      q.name.toLowerCase().includes(search.toLowerCase())
    );
  }
);

// -- Activations

// TODO: kv store 💙

export const $activeQueries = $queries;
