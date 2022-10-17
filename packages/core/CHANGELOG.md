# @farfetched/core

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
