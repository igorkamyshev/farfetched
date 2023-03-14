import {
  type Event,
  type Store,
  type EventAsReturnType,
  createEvent,
  createStore,
  sample,
  scopeBind,
  createEffect,
  is,
  attach,
} from 'effector';

/**
 * Creates an event that triggers after a user types a given sequence on a keyboard in a browser
 *
 * @param wantedSequence - Sequence of keys that should be typed
 * @param options.start - Event that triggers the start of the listening, used to bound result of operator to `scope`
 * @param options.stop - Event that destroys listener
 */
function keyboardSequence(
  wantedSequence: Store<string> | string,
  options: { setup: Event<void>; teardown?: Event<void> }
): EventAsReturnType<void> {
  const keypress = createEvent<KeyboardEvent>();

  const $pressedKeys = createStore<string[]>([], { serialize: 'ignore' });

  const $boundKeypress = createStore<EventListener | null>(null, {
    serialize: 'ignore',
  });

  sample({
    clock: keypress,
    source: $pressedKeys,
    fn: (oldKeys, event) => [...oldKeys, event.key],
    target: $pressedKeys,
  });

  const subscribeFx = createEffect(() => {
    const boundKeypress = scopeBind(keypress, {
      safe: true,
    });

    document.addEventListener('keypress', boundKeypress);

    return boundKeypress;
  });

  const unsubscribeFx = attach({
    source: $boundKeypress,
    effect(boundKeypress) {
      if (!boundKeypress) return;
      document.removeEventListener('keypress', boundKeypress);
    },
  });

  sample({ clock: options.setup, target: subscribeFx });
  sample({ clock: subscribeFx.doneData, target: $boundKeypress });
  if (options.teardown) {
    sample({ clock: options?.teardown, target: unsubscribeFx });
    sample({ clock: unsubscribeFx.done, target: $boundKeypress.reinit! });
  }

  const $wantedSequence: Store<string> = is.store(wantedSequence)
    ? wantedSequence
    : createStore(wantedSequence as string, { serialize: 'ignore' });

  const typed = sample({
    source: { pressedKeys: $pressedKeys, wantedSequence: $wantedSequence },
    filter: ({ pressedKeys, wantedSequence }) =>
      pressedKeys.join('').includes(wantedSequence),
    fn: () => {
      // noting
    },
  });

  sample({ clock: typed, fn: () => [], target: $pressedKeys });

  return typed;
}

export { keyboardSequence };
