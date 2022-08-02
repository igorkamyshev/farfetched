import { sample, Event } from 'effector';
import { expectType } from 'tsd';

import { AbortError } from '../../errors';
import { abortable, isAborted, isNotAborted } from '../abortable';

const fFx = abortable({
  name: 'fFx',
  effect(params: number) {
    return params;
  },
});

expectType<Error[]>([new Error() as Error | AbortError].filter(isNotAborted));
expectType<AbortError[]>([new Error() as Error | AbortError].filter(isAborted));

expectType<Event<AbortError>>(
  sample({ clock: fFx.failData, filter: isAborted })
);
// TODO: broken due to Effector
// expectType<Event<Error>>(sample({ clock: fFx.failData, filter: isNotAborted }));
