---
outline: [2, 3]
---

# `FormData` in _Mutation_

Sometimes you need to send a file or a blob to the server. In this case, you can use the `FormData` object.

## Plain solution

It can be done in with a simple JS-function:

```js
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  return fetch('/upload', {
    method: 'POST',
    body: formData,
  });
}
```

Now, let's connect it to the [_Mutation_](/api/primitives/mutation):

```js
import { createMutation } from '@farfetched';

const uploadFileMutation = createMutation({ handler: uploadFile });
```

That is it! Now you can use `uploadFileMutation` across your application as any other [_Mutation_](/api/primitives/mutation).

## Enhancements

However, it would be nice to have some additional features:

1. Parse the response as JSON and apply [_Contract_](/api/primitives/contract) to it because we have to be [suspicious about the server responses](/statements/never_trust).
2. Allow Farfetched to cancel the [_Mutation_](/api/primitives/mutation) if application has to.
3. Provide a way to create as many [_Mutations_](/api/primitives/mutation) to upload different files as we need.

Let us implement these features one by one.

### Parse the response as JSON

Actually, it is very easy to do. We just need to call `.json` method of the response and handle the possible errors:

```js
import { createMutation, preparationError } from '@farfetched';

const uploadFileMutation = createMutation({
  handler: uploadFile, // [!code --]
  effect: createEffect(async (file) => {
    const response = await uploadFile(file);

    try {
      const parsedJson = await response.json();
      return parsedJson;
    } catch (e) {
      throw preparationError({ reason: 'Response is not JSON' });
    }
  }),
});
```

Note that we catch the error and throw a new one. It is important because we want to have a unified error handling across the application and distinguish the errors by [error guards](/api/utils/error_guards).

### Apply the [_Contract_](/api/primitives/contract)

The next step is to apply the [_Contract_](/api/primitives/contract) to the parsed JSON. Luckily, [`createMutation`](/api/factorirs/create_mutation) has a special option for that:

```js
import { createMutation, preparationError } from '@farfetched';

const uploadFileMutation = createMutation({
  effect: createEffect(async (file) => {
    const response = await uploadFile(file);

    try {
      const parsedJson = await response.json();
      return parsedJson;
    } catch (e) {
      throw preparationError({ reason: 'Response is not JSON' });
    }
  }),
  contract: UploadFileResponseContract, // [!code ++]
});
```

To better understand [_Contracts_](/api/primitives/contract), please read [tutorial articles about it](/tutorial/contracts).

### Allow Farfetched to cancel the [_Mutation_](/api/primitives/mutation)

To cancel the [_Mutation_](/api/primitives/mutation), we need to use the [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) API. It is a standard API, so you can use it with any library.

Just create an instance of the [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) and pass its [`signal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to the `uploadFile` function:

```js
import { createMutation, preparationError, onAbort } from '@farfetched';

const uploadFileMutation = createMutation({
  effect: createEffect(async (file) => {
    const abortController = new AbortController(); // [!code ++]
    onAbort(() => abortController.abort()); // [!code ++]

    const response = await uploadFile(file, {
      signal: abortController.signal, // [!code ++]
    });

    try {
      const parsedJson = await response.json();
      return parsedJson;
    } catch (e) {
      throw preparationError({ reason: 'Response is not JSON' });
    }
  }),
  contract: UploadFileResponseContract,
});
```

Additionally, we need to pass the [`signal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to the [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) function:

```js
async function uploadFile(file, { signal }) {
  const formData = new FormData();
  formData.append('file', file);

  return fetch('/upload', {
    method: 'POST',
    body: formData,
    signal, // [!code ++]
  });
}
```

That is it! Now we can cancel the `uploadFileMutation` as any other [_Mutation_](/api/primitives/mutation) in Farfetched.

### Turn it into a factory

Now we have single [_Mutation_](/api/primitives/mutation) to upload a file. However, it would be nice to have a factory to create as many [_Mutations_](/api/primitives/mutation) as we need. Let us turn `uploadFileMutation` into a factory:

```js
function createUploadFileMutation() {
  return createMutation({
    /* ... */
  });
}
```

We just moved the [_Mutation_](/api/primitives/mutation) creation into a function. Now we can create as many [_Mutations_](/api/primitives/mutation) as we need:

```js
const uploadAvatarMutation = createUploadFileMutation();
const uploadPhotoMutation = createUploadFileMutation();
/* ... */
```

### SSR, `cache` and DevTools support

::: tip Deep dive
If you want to learn more about the reasons behind this requirement, please read [this article](/recipes/sids).
:::

If you use Farfetched in SSR, want to use [DevTools](/tutorial/devtools) or [`cache`](/api/operators/cache), you need to provide a unique name for each [_Mutation_](/api/primitives/mutation). It can be done by passing the `name` option to the [`createMutation`](/api/factorirs/create_mutation) factory:

```js
function createUploadFileMutation({ name }) {
  return createMutation({
    name, // [!code ++]
    /* ... */
  });
}

const uploadAvatarMutation = createUploadFileMutation({
  name: 'uploadAvatar', // [!code ++]
});
const uploadPhotoMutation = createUploadFileMutation({
  name: 'uploadPhoto', // [!code ++]
});
```

#### Code transformations

However, it is not very convenient to pass the `name` option every time and control the uniqueness of the names manually. We can do better with automated code transformation.

<!--@include: ../shared/sids_plugins.md-->

#### Custom factories

Note that code transformations **does not support custom factories out of the box**. So, you have to explicitly mark you factory as a factory. We recommend using [`@withease/factories` package](https://withease.pages.dev/factories/) for that:

```js
import { createFactory, invoke } from '@withease/factories';

/* [!code ++:1] */ const createUploadFileMutation = createFactory(() => {
  return createMutation({
    /* ... */
  });
});

const uploadAvatarMutation = createUploadFileMutation(); // [!code --]
const uploadAvatarMutation = invoke(createUploadFileMutation); // [!code ++]

const uploadPhotoMutation = createUploadFileMutation(); // [!code --]
const uploadPhotoMutation = invoke(createUploadFileMutation); // [!code ++]
```

## FAQ

::: details Q: Why Farfetched does not provide a factory for `FormData`?
**A:**
APIs that accept `FormData` are very different. Some of them accept only `FormData`, some of them accept `FormData` and other parameters, some of them accept `FormData` and return a response as a plain text, some of them accept `FormData` and return a response as JSON, etc.

So, it is quite hard to provide a factory that will cover all possible cases. Since this is a quite rare use case, we decided to not provide a factory for it and let you create your own factory with this recipe.
:::

:::details Q: Why do I need to handle `AbortController` manually?

**A:**
All factories in Farfetched are divided into two categories: specific factories and basic factories.

Specific factories like `createJsonMutation` provide less flexibility but more convenience. For example, `createJsonMutation` handles `AbortController` for you.

Basic factories like `createMutation` provide more flexibility but less convenience. Since they allow to use any HTTP-transports, they do not handle `AbortController` for you because it is impossible to do it in a generic way.

Read more about it in [the article about Data flow in Remote Operations](/recipes/data_flow).

:::

## Conclusion

Congratulations! Now you know how to create a [_Mutation_](/api/primitives/mutation) to upload a file with Farfetched.

The basic usage of `FormData` is quite simple:

```js
import { createMutation } from '@farfetched';

const uploadFileMutation = createMutation({ handler: uploadFile });

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  return fetch('/upload', {
    method: 'POST',
    body: formData,
  });
}
```

But it is a lot of room for improvements which is covered in enhancements section.
