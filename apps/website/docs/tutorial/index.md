# Tutorial

## Install

Install `farfethed` and its peer dependencies

with `pnpm`

```sh
pnpm install @farfecthed/core effector
```

with `yarn`

```sh
yarn add @farfecthed/core effector
```

with `npm`

```sh
npm install @farfecthed/core effector
```

## _Query_ creation

```ts
const languageListQuery = createQuery({
  handler: async () =>
    fetch('https://api.salo.com/languages.json').then((res) => res.json()),
});
```

## _Query_ usage

```ts
// view.ts

// Subscribe on the received data
languageListQuery.$data.watch((languages) => {
  renderLanguageList(languages);
});

// Subscribe on the received error
languageListQuery.$error.watch((error) => {
  renderErrorScreen(error);
});

// Start execution
languageListQuery.start();
```

## That is it

You are gorgeous! A Query starts right after `start` call, when it has done, callback in `watch` will be executed with received data.
