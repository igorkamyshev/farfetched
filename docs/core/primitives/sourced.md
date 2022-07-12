# Sourced

Almost all of config's fields can be written in many ways:

## Plain value

It will be passed as is.

It should be used when the value of the field cannot change during application lifecycle.

## [_Store_](https://effector.dev/docs/api/effector/store) with a value

It resolves to the current value that will be passed.

It should be used when the value of the field can change independently. For example, if you want to pass `userId` to some field, it is good idea to pass it as a [_Store_](https://effector.dev/docs/api/effector/store) because `userId` can change after login/logout and these processes do not affect a [_Query_](./query.md) directly.

## Function `(params) => value`

It is called with parameter of the [_Query_](./query.md), returned value will be passed to the request as query parameters.

It is a good way to formulate some field based on Query parameters.

## `{ source: Store, fn: (params, source) => value }`

In this case `fn` will be called with parameter of the [_Query_](./query.md) and current value of the `source` [_Store_](https://effector.dev/docs/api/effector/store), returned value will be passed

It combines a way to formulate field based on [_Query_](./query.md) parameters and based on external [_Store_](https://effector.dev/docs/api/effector/store). So, you can use both data sources to define the final field value.
