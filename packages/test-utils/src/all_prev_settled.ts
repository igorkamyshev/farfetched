import { allSettled, createEvent, Scope } from 'effector';

const dummyEvent = createEvent();

function allPrevSettled(scope: Scope): Promise<void> {
  return allSettled(dummyEvent, { scope });
}

export { allPrevSettled };
