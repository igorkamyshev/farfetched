import { createJsonQuery } from '../create_json_query';
import { Contract } from '../../contract/type';

// Does not matter
const response = {
  contract: {} as Contract<unknown, unknown>,
  mapData: <T>(v: T) => v,
};

// Does not matter
const url = 'http://api.salo.com';

no_body_in_get: {
  const query1 = createJsonQuery({
    request: { url, method: 'GET' },
    response,
  });

  const query2 = createJsonQuery({
    // @ts-expect-error body is not allowed in GET request
    request: { url, method: 'GET', body: {} },
    response,
  });
}

body_in_not_get: {
  const query1 = createJsonQuery({
    request: { url, method: 'POST', body: {} },
    response,
  });

  const query2 = createJsonQuery({
    request: { url, method: 'POST' },
    response,
  });
}
