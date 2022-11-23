import { Contract } from '../../contract/type';
import { createJsonQuery } from '../../query/create_json_query';
import { cache } from '../cache';

{
  const withInitialData = createJsonQuery({
    initialData: [],
    request: {
      method: 'GET',
      url: 'https://some.url',
    },
    response: {
      contract: {} as Contract<unknown, []>,
    },
  });

  cache(withInitialData);
}

{
  const noInitialData = createJsonQuery({
    request: {
      method: 'GET',
      url: 'https://some.url',
    },
    response: {
      contract: {} as Contract<unknown, []>,
    },
  });

  cache(noInitialData);
}
