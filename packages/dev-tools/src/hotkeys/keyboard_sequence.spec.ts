/**
 * @vitest-environment jsdom
 */

import userEvent from '@testing-library/user-event';
import { allSettled, fork } from 'effector';
import { vi } from 'vitest';

import { appInited } from '../viewer';
import { keyboardSequence } from './keyboard_sequence';

describe('keyboardSequence', () => {
  test('trigger after typing', async () => {
    const typed = keyboardSequence('iddqd');

    const listener = vi.fn();
    typed.watch(listener);

    const user = userEvent.setup();

    const scope = fork();

    await allSettled(appInited, { scope });

    await user.keyboard('iddqd');
    expect(listener).toBeCalledTimes(1);

    await user.keyboard('iddqd');
    expect(listener).toBeCalledTimes(2);
  });

  test('DO NOT open after random typing', async () => {
    const typed = keyboardSequence('randomstring');

    const listener = vi.fn();
    typed.watch(listener);

    const user = userEvent.setup();

    const scope = fork();

    await allSettled(appInited, { scope });

    await user.keyboard('iddqd');

    expect(listener).not.toHaveBeenCalled();
  });
});
