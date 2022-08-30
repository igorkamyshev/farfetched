# Validator

A rule to dynamically validate received data.

## `ValidationResult`

A _Validator_ have to respond with `ValidationResult` that could be one of the following values:

- `true` or **empty array** — that means the data is valid
- `false` or **error string** or **non-empty array with error strings** — that means the data is invalid

## Overloads

### Function

_Validator_ can be a simple function that accepts `data` and `params` and returns `ValidationResult`.

```ts
const validator = (data, params): ValidationResult => data[params.id] !== null;
```

### Function with external source

_Validator_ can be an object with field `source` which is any [_Store_](https://effector.dev/docs/api/effector/store) and `fn` witch is a function that accepts `data`, `params`, value of `source` and returns `ValidationResult`.

```ts
const validator = {
  source: $externalStore,
  fn: (data, params, externalSource): ValidationResult =>
    data[params.id] !== null && data[externalSource.id] !== null,
};
```
