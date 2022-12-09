# @farfetched/core

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
