---
title: Barrier Circuit Breaker

outline: [2, 3]

version: v0.13
---

# Barrier Circuit Breaker

This ADR is effective starting from [v0.13](/releases/0-13).

::: tip TL;DR

Added optional `circuitBreaker` to [`createBarrier`](/api/factories/create_barrier) to allow adding custom circuit breaker logic to a [_Barrier_](/api/primitives/barrier).

```ts
const authBarrier = createBarrier({
  activateOn: {
    failure: isHttpErrorCode(401),
  },
  perform: [getTokenMutation],
  circuitBreaker({ performed, deactivated, $active, breakCircuit }) {
    const $times = createStore(0);

    sample({
      clock: performed,
      filter: $active,
      source: $times,
      fn: (times) => times + 1,
      target: $times,
    });

    sample({
      clock: $times,
      filter: (times) => times > 10,
      target: breakCircuit,
    });

    sample({
      clock: deactivated,
      target: $times.reinit,
    });
  },
});
```

:::

## Problem

::: tip
Original issue: [farfetched#458](https://github.com/igorkamyshev/farfetched/issues/458)
:::
