# Server side rendering (SSR)

One of the most important and difficult to implement part of SSR is data-fetching. Farfetched aims to make it smooth and easy.

Farfetched is based on [Effector](https://effector.dev), that have an [excellent support of SSR](https://dev.to/effector/the-best-part-of-effector-4c27), so you can handle data-fetching easily if you follow some simple rules:

- [**do not** start fetching in render-cycle](/statements/render_as_you_fetch.md)
- **do** use [Fork API in Effector](https://effector.dev/en/api/effector/fork/) and make sure that your application has correct [SIDs](/recipes/sids)
- **do** use [Effector](https://effector.dev) operators to express your control flow

That is it, just start your application on server and wait for all computation finished:

```ts
async function renderApp() {
  const scope = fork();

  await allSettled(appStarted, { scope });

  const html = renderUI(scope);

  return html;
}
```
