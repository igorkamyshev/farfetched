import { Event } from 'effector';
import { expectType } from 'tsd';
import { declareParams } from '../../misc/params';

import { createJsonMutation } from '../create_json_mutation';

no_params: {
  no_body_for_GET: {
    const mutation = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: {},
    });

    expectType<Event<void>>(mutation.start);

    const invalidMutation = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
        // @ts-expect-error body is not allowed for GET
        body: {},
      },
      response: {},
    });
  }

  optional_body_for_POST: {
    const mutationWithBody = createJsonMutation({
      request: {
        url: '',
        method: 'POST' as const,
        body: {},
      },
      response: {},
    });

    expectType<Event<void>>(mutationWithBody.start);

    const mutationNoBody = createJsonMutation({
      request: {
        url: '',
        method: 'POST' as const,
      },
      response: {},
    });

    expectType<Event<void>>(mutationNoBody.start);
  }
}

explicit_params: {
  no_body_for_GET: {
    const mutation = createJsonMutation({
      params: declareParams<number>(),
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: {},
    });

    expectType<Event<number>>(mutation.start);

    const invalidMutation = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
        // @ts-expect-error body is not allowed for GET
        body: {},
      },
      response: {},
    });
  }

  optional_body_for_POST: {
    const mutationWithBody = createJsonMutation({
      params: declareParams<number>(),
      request: {
        url: '',
        method: 'POST' as const,
        body: {},
      },
      response: {},
    });

    expectType<Event<number>>(mutationWithBody.start);

    const mutationNoBody = createJsonMutation({
      params: declareParams<number>(),
      request: {
        url: '',
        method: 'POST' as const,
      },
      response: {},
    });

    expectType<Event<number>>(mutationNoBody.start);
  }
}
