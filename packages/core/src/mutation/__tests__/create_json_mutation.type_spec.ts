import { Event } from 'effector';
import { expectType } from 'tsd';
import { Contract } from '../../contract/type';

import { unknownContract } from '../../contract/unknown_contract';
import { declareParams } from '../../misc/params';
import { createJsonMutation } from '../create_json_mutation';

no_params: {
  no_body_for_GET: {
    const mutation = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
    });

    expectType<Event<void>>(mutation.start);

    const invalidMutation = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
        // @ts-expect-error body is not allowed for GET
        body: {},
      },
      response: { contract: unknownContract },
    });
  }

  optional_body_for_POST: {
    const mutationWithBody = createJsonMutation({
      request: {
        url: '',
        method: 'POST' as const,
        body: {},
      },
      response: { contract: unknownContract },
    });

    expectType<Event<void>>(mutationWithBody.start);

    const mutationNoBody = createJsonMutation({
      request: {
        url: '',
        method: 'POST' as const,
      },
      response: { contract: unknownContract },
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
      response: { contract: unknownContract },
    });

    expectType<Event<number>>(mutation.start);

    const invalidMutation = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
        // @ts-expect-error body is not allowed for GET
        body: {},
      },
      response: { contract: unknownContract },
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
      response: { contract: unknownContract },
    });

    expectType<Event<number>>(mutationWithBody.start);

    const mutationNoBody = createJsonMutation({
      params: declareParams<number>(),
      request: {
        url: '',
        method: 'POST' as const,
      },
      response: { contract: unknownContract },
    });

    expectType<Event<number>>(mutationNoBody.start);
  }
}

extract_data_type_from_contarct: {
  const contract: Contract<unknown, number> = {} as any;
  const mutation = createJsonMutation({
    request: { url: '', method: 'GET' },
    response: { contract },
  });

  expectType<Event<{ data: number; params: void }>>(mutation.finished.success);
}

allow_expected_status: {
  const mutation1 = createJsonMutation({
    request: { url: '', method: 'GET' },
    response: { contract: unknownContract, status: { expected: 200 } },
  });

  const mutation2 = createJsonMutation({
    request: { url: '', method: 'GET' },
    response: { contract: unknownContract, status: { expected: [201, 204] } },
  });
}
