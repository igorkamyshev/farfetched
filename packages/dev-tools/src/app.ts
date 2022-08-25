import { variant } from 'forest';
import { combine, createEvent, createStore, Domain } from 'effector';
import { allQueries } from '@farfetched/core';

import { OpenTag } from './features/open_tag';
import { DevTools } from './features/dev_tools';
import { declareQueries } from './features/dev_tools/entities/query/model';

function App({ domain }: { domain?: Domain }) {
  type View = 'openTag' | 'devTools';

  //   const $activeView = createStore<View>('openTag');
  const $activeView = createStore<View>('devTools');

  const openDevTools = createEvent();
  const closeDevTools = createEvent();

  $activeView
    .on(openDevTools, () => 'devTools')
    .on(closeDevTools, () => 'openTag');

  if (domain) {
    declareQueries(allQueries({ domain }).map((q) => q.__.meta));
  }

  variant({
    source: combine({
      view: $activeView,
    }),
    key: 'view',
    cases: {
      devTools: () => DevTools({ handleCloseClick: closeDevTools }),
      openTag: () => OpenTag({ handleClick: openDevTools }),
    },
  });
}

export { App };
