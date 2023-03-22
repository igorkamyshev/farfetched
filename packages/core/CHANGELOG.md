# @farfetched/core

## 0.8.1

### Patch Changes

- c1ceb16: Fix extra `setup` calls of `@@trigger` in `keepFresh`
- 4c7f25f: Do not flood keys with same value in meta in `sessionStorageCache` and `localStorageCache`
- 0ca10d3: Do not skip `.refresh` for disabled _Query_, instead postpone it until enabling
- 0822244: Do not skip _Query_ execution with `.refresh` with different params

## 0.8.0

### Minor Changes

- f04aa0d: Allow to pass any string as `query` in `createJson*`
- 386752e: Expose original error in `NetworkError` as well
- 24cb348: Add new _Event_ for the _Query_ — `.refresh`
- f6ce0bf: Fix types of `connectQuery` in case of target Query<void, ...>
- e298d2f: Add new low-level function — `combineSourced`
- 573ad52: Add `.$idle` _Store_ that shows if fetching has started or not in _Remote Operations_
- 24cb348: Add new operator — `keepFresh`
- 19e9626: Mark `externalCache` as deprecated

### Patch Changes

- 2f6fa1c: Export `fetchFx` to allow low-level mocks
- 8b76a37: Fix `.$stale` in initial state, now it is `true`
- 25c051f: Fix error type of _Mutations_ and _Queries_ create by `createJson*` factories
- 90be139: Add utility types for _Remote Operations_ to public API
- c9766d0: Fix type inference of `attachOperation`

## 0.7.2

### Patch Changes

- be8bb8b: Return null for empty response without header in `createJson*`

## 0.7.1

### Patch Changes

- f1afd34: Add a response field in invalid data error

## 0.7.0

### Minor Changes

- 294f0ae: Add `name` field to meta of any _RemoteOperation_
- 7fd0c57: Share `inMemoryCache` between scopes, do not block `allSettled` in it
- 2116b36: Use `name` of a _Query_ as a part of key in `cache` in case of absent `sid` and uniq `name`
- 942cbf2: Allow to override `credentials` in `createJsonQuery` and `createJsonMutation`
- 79593c6: Make `unset` method of custom `cache` adapter required

## 0.6.4

### Patch Changes

- 5da04bf: Fix type inference in `createQuery` in `effect` and `mapData` overload

## 0.6.3

## 0.6.2

### Patch Changes

- 05b4860: Fix `cache` invalidation after `update`

## 0.6.1

### Patch Changes

- c2b67a6: Fix `cache` overlapping in `createJsonQuery`

## 0.6.0

### Minor Changes

- 521834d: Allow passing abort signal to `createJsonQuery` and `createJsonMutation`
- f7def6f: Ignore `params` while `cache` `createJsonQuery` to decrease number of cache misses
- b57c5ee: Add `attachOperation` operator
- c2431af: Parse response in `httpError` in `createJson*` as JSON
- b57c5ee: Expose `initialData` in _Query_ meta

### Patch Changes

- fa4a40f: Return `null` for empty response in `createJsonApiRequest` instead of `preparationError`

## 0.5.1

### Patch Changes

- 2ad92fb: Do not use value from `cache` on refetch after `update`

## 0.5.0

### Minor Changes

- 57abab2: Add config `concurrency.strategy` for `createJsonQuery` factory
- dcbdcaa: Support more formats in _Time_
- e914ba2: Add operator `update` to connect _Query_ and _Mutation_
- 127f78a: Pass params of source _Queries_ to `fn` in `connectQuery`
- e0802dd: Support `@@unitShape` protocol of Effector

### Patch Changes

- e52935e: Do not stop _Query_ after trying to `cache` entry with invalid key
- 41096d5: Decreased number of cache misses
- d32d69f: Skip in-flight _Query_ and _Mutation_ while disabling
- 41096d5: Do not try to serialize unserializable params during `cache`

## 0.4.1

### Patch Changes

- 9fb4ead: Export DynamicallySourcedField type
- b175216: Export FetchingStatus type

## 0.4.0

### Minor Changes

- 77a3832: Decrease bundle size by 36 percent
- a413bf9: Get rid of patronum, inline required functions
- 1638921: Change signature of mapper in `mapData` to be consistent with `.finished.*` _Events_
- d6ab20b: Change signature of Validator to be consistent with `.finished.*` _Events_
- dbd6fee: Change signature of `.finished.success` to be consistent with `.done` of _Effect_
- d92411c: Sync versions of all packages
- 6521bc7: Change signature of mapper in `connectQuery` to add more info about parents in future
- f6fbc4f: Remove deprecated overload of `retry`
- 90102e8: Add `TAKE_FIRST` strategy in concurrency settings of internal createApiRequest

### Patch Changes

- 8bb8bce: Get rid of @farfetched/misc, inline functions
- 3280ab9: Hide private types from published package

## 0.3.5

### Patch Changes

- 7cc84da: Fix incorrect cache saving in `cache` on _Query_ with `mapData`

## 0.3.4

### Patch Changes

- ffee151: Do not throw error on initializing stage for browser-only cache adapters in node-env

## 0.3.3

### Patch Changes

- 733c0dd: Fix incorrect typings of `cache` operator for Query with initial data

## 0.3.2

### Patch Changes

- 072aae1: Handle null values in Sourced fields

## 0.3.1

### Patch Changes

- 7498a4a: Remove dependency added by mistake — `runtypes`

## 0.3.0

### Minor Changes

- d1b5f5a: Add `cache` operator
- d1b5f5a: Allow passing Time as a `delay` in `retry`
- d1b5f5a: Add `sessionStorageCache` adapter
- d1b5f5a: Add option `initialData` for `createJsonQuery`
- d1b5f5a: Add option `initialData` for `createQuery`
- d1b5f5a: Allow using `retry` with Mutation
- d1b5f5a: Allow setting initial data for _Query_
- d1b5f5a: Add `inMemoryCache` adapter
- d1b5f5a: Support custom serialization for `$data` in Query with Effector 22.4
- d1b5f5a: Add `voidCache` adapter
- d1b5f5a: Add `localStorageCache` adapter
- d1b5f5a: Add `externalCache` adapter

## 0.2.6

### Patch Changes

- 9e9ba85: Handle nullish values in Sourced fields

## 0.2.5

### Patch Changes

- 989891f: Fix `connectQuery` incorrect inference of argument in `fn` in some cases

## 0.2.4

### Patch Changes

- 3fc1ff3: Expose types `ValidationResult` and `Validator`

## 0.2.3

### Patch Changes

- f373689: Add ESM build
- Updated dependencies [f373689]
  - @farfetched/misc@0.1.2

## 0.2.2

### Patch Changes

- e871f8b: Do not change `$status` for disabled Queries

## 0.2.1

### Patch Changes

- b4a594a: Fix type definitions of error guards

## 0.2.0

### Minor Changes

- 7c3c78f: Add `reset` command to Query
- 0162a13: Allow skipping body in non GET/QUERY requests in `createJsonQuery`
- cb5a598: Add new factory — `createMutation`
- f26284c: Add new stores to Query — `$failed` and `$succeeded`
- cb5a598: Add new factory — `createHeadlessMutation`
- cb5a598: Add new concept — Mutation
- 1b1fca4: Add `otherwise` to `retry` that is called after all attempts are exceeded
- cb5a598: Add new factory — `createJsonMutation`

### Patch Changes

- e3a922a: Fix `createJsonQuery` return object structure, now it passes `isQuery` check
- 55c1920: Ignore non-object values in headers transformers

## 0.1.2

### Patch Changes

- b345f60: Add license to package.json
- Updated dependencies [b345f60]
  - @farfetched/misc@0.1.1

## 0.1.1

### Patch Changes

- 269334f: Add missed dependencies to package.json
