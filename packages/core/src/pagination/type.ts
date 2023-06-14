import { Event, Store } from 'effector';

import { Query } from '../query/type';

/**
 * Params passing to mapData, predicates and other fn's of pagination.
 */
// Maybe it should be made as a shared type for other operations.
export interface ParamsAndResult<Params, Result> {
  result: Result;
  params: Params;
}

/**
 * Base interface for params of pagination operation.
 */
export interface RequiredPageParams {
  page: number;
}

// Pagination is just a special kind of query.
export interface Pagination<
  Params extends RequiredPageParams,
  Data,
  Error,
  InitialData = null
> extends Query<Params, Data, Error, InitialData> {
  /**
   * Last fetched page which should be equal "opened" by user.
   *
   * @default 0
   */
  $page: Store<number>;
  /**
   * There is next page.
   *
   * Filled by value from predicate 'hasNextPage' calling after every donned request.
   * @default false
   */
  $hasNext: Store<boolean>;
  /**
   * There is prevision page.
   *
   * Filled by value from predicate 'hasPrevPage' calling after every donned request.
   * @default false
   */
  $hasPrev: Store<boolean>;

  /**
   * Fetch next page if exists.
   * Using params from latest request and incrementing page prop.
   *
   * Requests won't be sent if status is initial.
   */
  next: Event<void>;
  /**
   * Fetch prevision page if exists.
   * Using params from latest request and incrementing page prop.
   *
   * Requests won't be sent if status is initial.
   */
  prev: Event<void>;
  /**
   * Fetch specific page. No check if it existing before request. Be careful.
   * Using params from latest request and incrementing page prop.
   *
   * Requests won't be sent if status is initial.
   */
  specific: Event<RequiredPageParams>;

  '@@unitShape': () => {
    data: Store<Data | InitialData>;
    stale: Store<boolean>;
    error: Store<Error | null>;
    page: Store<number>;
    pending: Store<boolean>;
    start: Event<Params>;
    next: Event<void>;
    prev: Event<void>;
    specific: Event<RequiredPageParams>;
  };
}
