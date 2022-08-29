# `createQuery`

## Formulae

### `createQuery({ handler })`

Creates [_Query_](../primitives/query.md) based on given asynchronous function.

```ts
const languagesQuery = createQuery({
  handler: async () => {
    const response = await fetch('https://api.salo.com/languages.json');

    return response.json();
  },
});
```

### `createQuery({ effect, validate? })`

Creates [_Query_](../primitives/query.md) based on given [_Effect_](https://effector.dev/docs/api/effector/effect).

Usage of [_Effect_](https://effector.dev/docs/api/effector/effect) instead of simple asynchronous function allows you to declare types of possible errors statically that will be passed to [_Query_](../primitives/query.md).

This form allows you to dynamically validate received data using [_Validator_](../primitives/validator.md) in the optional `validate` field.

```ts
const languagesQuery = createQuery({
  effect: createEffect<Response, void, EmptyLanguagesError>(async () => {
    const response = fetch('https://api.salo.com/languages.json');

    const data = response.json();

    if (!data.languages) {
      throw new EmptyLanguagesError();
    }

    return data.languages;
  }),
});

// typeof languagesQuery.$error === Store<EmptyLanguagesError | null>
```

### `createQuery({ effect, contract, validate? })`

Creates [_Query_](../primitives/query.md) based on given [_Effect_](https://effector.dev/docs/api/effector/effect).

[_Contract_](../primitives/contract.md) allows you to validate the response and decide how your application should treat it — as a success response or as a failed one. Furthermore, this form allows you to dynamically validate received data using [_Validator_](../primitives/validator.md) in the optional `validate` field.

```ts
const languagesQuery = createQuery({
  effect: fetchLanguagesFx,
  contarct: {
    data: {
      // Our API can return empty array of languages, we consider it as an invalid data
      validate: (response) => response.languages?.length > 0,
      extarct: (response) => response.languages,
    },
    error: {
      // Our API can return array on internal errors, we consider it as an error
      is: (response) => response.errors?.length > 0,
      extract: (response) => response.errors,
    },
  },
});

/* typeof languagesQuery.$error === Store<
 *   | InvalidDataError 👈 validation failed, languages list is empty
 *   | string[] 👈 API errors from response.errors
 *   | null 👈 no errors
 * >
 */
```

### `createQuery({ effect, contract?, validate?, mapData: Function })`

Creates [_Query_](../primitives/query.md) based on given [_Effect_](https://effector.dev/docs/api/effector/effect). Result of the effect will be validated against the [_Contract_](../primitives/contract.md) and the optional [_Validator_](../primitives/validator.md). Invalid result will cause the [_Query_](../primitives/query.md) to fail.

A valid data is passed to `mapData` callback as well as original parameters of the [_Query_](../primitives/query.md), result of the callback will be treated as a result of the [_Query_](../primitives/query.md).

```ts
const languagesQuery = createQuery({
  effect: fetchLanguagesFx,
  contarct: languagesContract,
  mapData(languages, params) {
    return {
      availableLanguages: languages,
      languageCanBeSelected: languages.length > 1,
    };
  },
});

/* typeof languagesQuery.$error === Store<{
 *   availableLanguages: string[],
 *   languageCanBeSelected: boolean,
 * }>
 */
```

### `createQuery({ effect, contract?, validate?, mapData: { source, fn } })`

Creates [_Query_](../primitives/query.md) based on given [_Effect_](https://effector.dev/docs/api/effector/effect). Result of the effect will be validated against the [_Contract_](../primitives/contract.md) and the optional [_Validator_](../primitives/validator.md). Invalid result will cause the query to fail.

A valid data is passed to `mapData.fn` callback as well as original parameters of the [_Query_](../primitives/query.md) and current value of `mapData.source` [_Store_](https://effector.dev/docs/api/effector/store), result of the callback will be treated as a result of the [_Query_](../primitives/query.md).

```ts
const $minimalLanguagesCount = createStore(1);

const languagesQuery = createQuery({
  effect: fetchLanguagesFx,
  contarct: languagesContract,
  mapData: {
    // Current value of $minimalLanguagesCount will be passed to `fn` as a third argument
    source: $minimalLanguagesCount,
    fn(languages, params, minimalLanguagesCount) {
      return {
        availableLanguages: languages,
        languageCanBeSelected: languages.length > minimalLanguagesCount,
      };
    },
  },
});

/* typeof languagesQuery.$error === Store<{
 *   availableLanguages: string[],
 *   languageCanBeSelected: boolean,
 * }>
 */
```

## Showcases

- [React + `createQuery`](../../../apps/showcase/react-create-query/)
- [SolidJS + `createQuery`](../../../apps/showcase/solid-create-query/)
