import { Event } from 'effector';
import { expectType } from 'tsd';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../misc/params';
import { Contract } from '../../contract/type';

// Does not matter
const response = {
  contract: {} as Contract<unknown, unknown, unknown>,
  mapData: <T>(v: T) => v,
};

// Does not matter
const request = {
  url: 'http://api.salo.com',
  method: 'GET' as const,
};

no_params_no_mapData: {
  const query = createJsonQuery({
    request,
    response,
  });

  expectType<Event<void>>(query.start);
}

no_params_mapData: {
  const query = createJsonQuery({
    request,
    response: {
      ...response,
      mapData() {
        // Does not matter
        return 1;
      },
    },
  });

  expectType<Event<void>>(query.start);
}

params_no_mapData: {
  const queryWithString = createJsonQuery({
    params: declareParams<string>(),
    request,
    response,
  });

  expectType<Event<string>>(queryWithString.start);

  const queryWithStringOrNumber = createJsonQuery({
    params: declareParams<string | number>(),
    request,
    response,
  });

  expectType<Event<string | number>>(queryWithStringOrNumber.start);

  const queryWithObject = createJsonQuery({
    params: declareParams<{ at: Date }>(),
    request,
    response,
  });

  expectType<Event<{ at: Date }>>(queryWithObject.start);
}

params_no_mapData: {
  const queryWithString = createJsonQuery({
    params: declareParams<string>(),
    request,
    response: {
      ...response,
      mapData() {
        // Does not matter
        return 1;
      },
    },
  });

  expectType<Event<string>>(queryWithString.start);

  const queryWithStringOrNumber = createJsonQuery({
    params: declareParams<string | number>(),
    request,
    response: {
      ...response,
      mapData() {
        // Does not matter
        return 1;
      },
    },
  });

  expectType<Event<string | number>>(queryWithStringOrNumber.start);

  const queryWithObject = createJsonQuery({
    params: declareParams<{ at: Date }>(),
    request,
    response: {
      ...response,
      mapData() {
        // Does not matter
        return 1;
      },
    },
  });

  expectType<Event<{ at: Date }>>(queryWithObject.start);
}
