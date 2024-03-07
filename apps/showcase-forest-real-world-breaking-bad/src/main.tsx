import { h, using } from 'forest';

import { RandomQuotesView } from './features/quote';

using(document.getElementById('root') as HTMLElement, () => {
  h('h1', { text: 'Breaking Bad 💙 Farfetched' });

  RandomQuotesView();
});
