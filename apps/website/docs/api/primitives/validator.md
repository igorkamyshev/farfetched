# Validator

A rule to dynamically validate received data.

## `ValidationResult`

A _Validator_ have to respond with `ValidationResult` that could be one of the following values:

- `true` or **empty array** — that means the data is valid
- `false` or **error string** or **non-empty array with error strings** — that means the data is invalid

## Overloads

### Function

_Validator_ can be a simple function that accepts `{ result, params }` object and returns `ValidationResult`.

```ts
const validator = ({ result, params }): ValidationResult =>
  result[params.id] !== null;
```

### Function with external source

_Validator_ can be an object with field `source` which is any [_Store_](https://effector.dev/docs/api/effector/store) and `fn` witch is a function that accepts object `{ result, params }` and the value of `source` and returns `ValidationResult`.

```ts
const validator = {
  source: $externalStore,
  fn: ({ result, params }, externalSource): ValidationResult =>
    result[params.id] !== null && result[externalSource.id] !== null,
};
```
