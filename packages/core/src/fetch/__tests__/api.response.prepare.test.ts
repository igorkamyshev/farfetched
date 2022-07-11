import { allSettled, fork } from 'effector';
import { expectType } from 'tsd';

import { createApiRequest } from '../api';
import { fetchFx } from '../fetch';

describe('remote_data/transport/api.response.prepare', () => {
  // Does not matter
  const request = {
    method: 'GET' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
    mapBody: () => 'some_body',
  };

  const noExtract = async <T>(v: T) => v;
  const no = async () => false;
  const yes = async () => true;
  const valid = async () => null;

  test('pass oriiginal response to preparation', async () => {
    let prepareCalledWith: any = null;

    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: {
          extract: async (response) => {
            prepareCalledWith = response;
            return response;
          },
        },
        data: { extract: noExtract, validate: valid },
        error: {
          is: no,
          extract: noExtract,
        },
      },
    });

    const ORIGINAL_RESPONSE = new Response('ok');

    const scope = fork({ handlers: [[fetchFx, () => ORIGINAL_RESPONSE]] });

    await allSettled(apiCallFx, {
      scope,
      params: {},
    });

    expect(prepareCalledWith).toBe(ORIGINAL_RESPONSE);
  });

  test('pass prepared data to error', async () => {
    let errorCalledWith: any = null;

    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: { extract: async (_) => 1 },
        data: { extract: noExtract, validate: valid },
        error: {
          is: yes,
          extract: async (v) => {
            expectType<number>(v);
            errorCalledWith = v;
            return v;
          },
        },
      },
    });

    const scope = fork({ handlers: [[fetchFx, () => new Response('ok')]] });

    await allSettled(apiCallFx, {
      scope,
      params: {},
    });

    expect(errorCalledWith).toBe(1);
  });

  test('pass prepared data to data', async () => {
    let dataCalledWith: any = null;

    const apiCallFx = createApiRequest({
      request,
      response: {
        prepare: { extract: async (_) => 1 },
        data: {
          extract: async (v) => {
            expectType<number>(v);
            dataCalledWith = v;
            return v;
          },
          validate: valid,
        },
        error: {
          is: no,
          extract: noExtract,
        },
      },
    });

    const scope = fork({ handlers: [[fetchFx, () => new Response('ok')]] });

    await allSettled(apiCallFx, {
      scope,
      params: {},
    });

    expect(dataCalledWith).toBe(1);
  });
});
