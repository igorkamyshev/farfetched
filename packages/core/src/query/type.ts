import { Store, Event } from 'effector';

import { RemoteOperation } from '../remote_operation/type';
import { type Serialize } from '../libs/patronus';

const QuerySymbol = Symbol('Query');

interface QueryMeta<Data, InitialData> {
  /**
   * This field is used to determine how to serialize data in various cases:
   * - transfer state from server to client during SSR
   * - save state to persistent storage during caching
   */
  serialize: Serialize<Data | InitialData>;
}

interface Query<Params, Data, Error, InitialData = null>
  extends RemoteOperation<Params, Data, Error, QueryMeta<Data, InitialData>> {
  /**
   * The reactive value of the latest received data.
   *
   * If there was an error during fetching or there has not been a request yet, the store will be `null`.
   */
  $data: Store<Data | InitialData>;
  /**
   * The reactive value of the data retrieval error.
   *
   * If the data was successfully fetched or there is no request yet, the store will be `null`.
   */
  $error: Store<Error | null>;
  /**
   * Is data stale?
   */
  $stale: Store<boolean>;
  /** Event to reset the whole state of the query */
  reset: Event<void>;
}

function isQuery(value: any): value is Query<any, any, any> {
  return value?.__?.kind === QuerySymbol;
}

export { type Query, type QueryMeta, QuerySymbol, isQuery };
