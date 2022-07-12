import { sample, Event } from 'effector';
import { expectType } from 'tsd';

import { abortable, AbortedError, isAborted, isNotAborted } from '../abortable';

const fFx = abortable({
  name: 'fFx',
  effect(params: number) {
    return params;
  },
});

expectType<Error[]>([new Error() as Error | AbortedError].filter(isNotAborted));
expectType<AbortedError[]>(
  [new Error() as Error | AbortedError].filter(isAborted)
);

expectType<Event<AbortedError>>(
  sample({ clock: fFx.failData, filter: isAborted })
);
// TODO: broken due to Effector
// expectType<Event<Error>>(sample({ clock: fFx.failData, filter: isNotAborted }));
