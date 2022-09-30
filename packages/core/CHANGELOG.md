# @farfetched/core

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
