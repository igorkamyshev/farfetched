import { h } from 'forest';

import { $querySearch, querySearchChanged } from '../model';
import { extractValue } from '../../../../../shared/events';

function QuerySearch() {
  h('input', {
    attr: { value: $querySearch, placeholder: 'query name' },
    handler: {
      input: querySearchChanged.prepend(extractValue),
    },
  });
}

export { QuerySearch };
