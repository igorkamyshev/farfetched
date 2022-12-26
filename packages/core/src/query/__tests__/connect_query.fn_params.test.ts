import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { connectQuery } from '../connect_query';
import { createQuery } from '../create_query';

describe('connectQuery use params in fn', () => {
  test('single parent', async () => {
    const languagesQ = createQuery({
      handler: vi.fn(async (p: string) => [p]),
    });
    const someTargetQ = createQuery({
      handler: vi.fn(async (param: string) => []),
    });

    const fn = vi.fn();

    connectQuery({
      source: languagesQ,
      fn,
      target: someTargetQ,
    });

    const scope = fork();

    await allSettled(languagesQ.start, { scope, params: 'first' });
    expect(fn).toHaveBeenCalledWith({ params: 'first', result: ['first'] });

    await allSettled(languagesQ.start, { scope, params: 'second' });
    expect(fn).toHaveBeenCalledWith({ params: 'second', result: ['second'] });
  });

  test('multi parent', async () => {
    const languagesQ = createQuery({
      handler: vi.fn(async (p: string) => [p]),
    });
    const blockQ = createQuery({
      handler: vi.fn(async (p: string) => [p]),
    });
    const someTargetQ = createQuery({
      handler: vi.fn(async (param: string) => []),
    });

    const fn = vi.fn();

    connectQuery({
      source: { language: languagesQ, block: blockQ },
      fn,
      target: someTargetQ,
    });

    const scope = fork();

    await allSettled(languagesQ.start, { scope, params: 'first_l' });
    await allSettled(blockQ.start, { scope, params: 'first_b' });
    expect(fn).toHaveBeenCalledWith({
      language: { params: 'first_l', result: ['first_l'] },
      block: { params: 'first_b', result: ['first_b'] },
    });

    await allSettled(languagesQ.start, { scope, params: 'second_l' });
    expect(fn).toHaveBeenCalledWith({
      language: { params: 'second_l', result: ['second_l'] },
      block: { params: 'first_b', result: ['first_b'] },
    });

    await allSettled(blockQ.start, { scope, params: 'second_b' });
    expect(fn).toHaveBeenCalledWith({
      language: { params: 'second_l', result: ['second_l'] },
      block: { params: 'second_b', result: ['second_b'] },
    });
  });
});
