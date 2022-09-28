import { allSettled, fork } from 'effector';

import { unknownContract } from '../../contract/unknown_contract';
import { createJsonMutation } from '../create_json_mutation';
import { isMutation } from '../type';

describe('createJsonMutation', () => {
  test('isMutation', () => {
    const mutation = createJsonMutation({
      request: { url: 'https://api.salo.com', method: 'GET' },
      response: { contract: unknownContract },
    });

    expect(isMutation(mutation)).toBeTruthy();
  });

  test('start triggers executeFx', async () => {
    const mutation = createJsonMutation({
      request: { url: 'https://api.salo.com', method: 'GET' },
      response: { contract: unknownContract },
    });

    const mockFn = jest.fn();

    const scope = fork({ handlers: [[mutation.__.executeFx, mockFn]] });

    await allSettled(mutation.start, { scope });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith({
      body: null,
      headers: null,
      query: null,
      url: 'https://api.salo.com',
    });
  });
});
