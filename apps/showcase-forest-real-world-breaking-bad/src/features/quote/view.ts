import { createEvent, restore, sample } from 'effector';
import { h, handler, list, route, remap, val, text } from 'forest';

import { randomQuotesQuery } from './query';
import { extractNumber } from '../../shared/dom';

export function RandomQuotesView() {
  const changeAmount = createEvent<number>();
  const $amount = restore(changeAmount, 1);

  const loadQuotes = createEvent<SubmitEvent>();

  sample({
    clock: loadQuotes,
    source: $amount,
    fn: (amount) => ({ amount }),
    target: randomQuotesQuery.start,
  });

  h('form', () => {
    handler({ prevent: true }, { submit: loadQuotes });

    h('label', () => {
      text`Amount`;

      h('input', {
        attr: { value: $amount, type: 'number' },
        handler: {
          input: changeAmount.prepend(extractNumber),
        },
      });
    });

    h('button', { attr: { type: 'submit' }, text: 'Load random quotes' });
  });

  route({
    source: randomQuotesQuery.$data,
    visible: (items) => items.length > 0,
    fn() {
      h('h2', { text: 'Random quotes' });

      h('ol', () => {
        list(randomQuotesQuery.$data, ({ store: $item }) => {
          const [$author, $quote] = remap($item, ['author', 'quote']);

          h('li', {
            text: val`${$author}: ${$quote}`,
          });
        });
      });
    },
  });
}
