# `createBarrier` <Badge type="tip" text="since v0.10.0" />

Creates a [_Barrier_](/api/primitives/barrier) object.

## Formulae

### `createBarrier({ active, perform? })`

```ts
import { createBarrier } from '@farfetched/core';
import { combine } from 'effector';

const authBarrier = createBarrier({
  active: combine(
    { token: $token, now: $now },
    ({ token, now }) => parseToken(token.exp) > now
  ),
  perform: [renewTokenMutationFx],
});
```

Configuration fields:

- `active`: [_Sourced_](/api/primitives/sourced) boolean.
- `perform`: optional array of [_Performers_](#performer), that will be started in case some operation that uses this [_Barrier_](/api/primitives/barrier) is started and [_Barrier_](/api/primitives/barrier) is `$active`.

### `createBarrier({ activateOn, perform })`

```ts
import { createBarrier, isHttpError } from '@farfetched/core';
import { combine } from 'effector';

const authBarrier = createBarrier({
  activateOn: {
    failure: isHttpError(401),
  },
  perform: [renewTokenMutationFx],
});
```

Configuration fields:

- `activateOn.failure`: callback that will be called in case of failure of some operation that uses this [_Barrier_](/api/primitives/barrier). If it returns `true`, [_Barrier_](/api/primitives/barrier) will be activated.
- `activateOn.success`: callback that will be called in case of success of some operation that uses this [_Barrier_](/api/primitives/barrier). If it returns `true`, [_Barrier_](/api/primitives/barrier) will be activated.
- `perform`: array of [_Performers_](#performer), that will be started in case some operation that uses this [_Barrier_](/api/primitives/barrier) is started and [_Barrier_](/api/primitives/barrier) is `$active`.

### `createBarrier({ activateOn, deactivateOn })`

```ts
import { createBarrier } from '@farfetched/core';

const authBarrier = createBarrier({
  activateOn: userOpenedModal,
  deactivateOn: userClosedModal,
});
```

Configuration fields:

- `activateOn`: [_Event_](https://effector.dev/docs/api/effector/event) that will activate [_Barrier_](/api/primitives/barrier) when called.
- `deactivateOn`: [_Event_](https://effector.dev/docs/api/effector/event) that will deactivate [_Barrier_](/api/primitives/barrier) when called.

## Performer

Any of the following form can be used in `perform` field:

1. [_Query_](/api/primitives/query) that does not accept any parameters
2. [_Mutation_](/api/primitives/mutation) that does not accept any parameters
3. [_Effect_](https://effector.dev/docs/api/effector/effect) that does not accept any parameters
4. Object `{ start, end }` where `start` and `end` are [_Events_](https://effector.dev/docs/api/effector/event) that do not accept any parameters. `start` [_Event_](https://effector.dev/docs/api/effector/event) will be called when the [_Barrier_](/api/primitives/barrier) is activated, `end` [_Event_](https://effector.dev/docs/api/effector/event) is expected to be called when the performer is finished.
