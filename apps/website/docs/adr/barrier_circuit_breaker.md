---
title: Barrier Circuit Breaker

outline: [2, 3]

version: v0.13
---

# Barrier Circuit Breaker

This ADR is effective starting from [v0.13](/releases/0-13).

::: tip TL;DR

Added new [_Events_](https://effector.dev/en/api/effector/event/) to [_Barrier_](/api/primitives/barrier) that allow to implement a circuit breaker pattern.

```ts
const authBarrier = createBarrier({
  activateOn: {
    failure: isHttpErrorCode(401),
  },
  perform: [getTokenMutation],
});

const $times = createStore(0);

sample({
  clock: authBarrier.performed, // <- New Event on Barrier
  filter: authBarrier.$active,
  source: $times,
  fn: (times) => times + 1,
  target: $times,
});

sample({
  clock: $times,
  filter: (times) => times > 10,
  target: authBarrier.forceDeactivate, // <- New Event on Barrier
});

sample({
  clock: authBarrier.deactivated,
  target: $times.reinit,
});
```

:::

## Problem

::: tip
Original issue: [farfetched#458](https://github.com/igorkamyshev/farfetched/issues/458)
:::
