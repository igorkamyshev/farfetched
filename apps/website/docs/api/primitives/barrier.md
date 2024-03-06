# Barrier <Badge type="tip" text="since v0.11" />

Object that could be used to postpone the execution of the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation). Barrier can be created with the [`createBarrier`](/api/factories/create_barrier) function and applied to the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) with the [`applyBarrier`](/api/operators/apply_barrier) operator.

For user-land code, it is a read-only object that have the following properties:

## `$active`

[_Store_](https://effector.dev/en/api/effector/store/) with the current status of the _Barrier_. It must not be changed directly. Can be `true` or `false`. If it is `true` then the _Barrier_ is active and the execution of the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) will be postponed in case of [applying the _Barrier_ to it](/api/operators/apply_barrier).

## `activated`

[_Event_](https://effector.dev/en/api/effector/event/) that will be triggered when the _Barrier_ is activated.

## `deactivated`

[_Event_](https://effector.dev/en/api/effector/event/) that will be triggered when the _Barrier_ is deactivated.
