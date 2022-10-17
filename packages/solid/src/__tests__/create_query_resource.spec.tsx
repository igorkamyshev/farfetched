/**
 * @vitest-environment jsdom
 */

import { allSettled, fork, sample, scopeBind } from 'effector';
import { describe, expect, test, afterEach } from 'vitest';
import { ErrorBoundary, For, Suspense } from 'solid-js/web';
import { render, cleanup, screen } from 'solid-testing-library';
import { Provider } from 'effector-solid';
import { createMutation, createQuery } from '@farfetched/core';
import { allPrevSettled } from '@farfetched/test-utils';
import { createDefer } from '@farfetched/misc';
import { setTimeout } from 'timers/promises';

import { createQueryResource } from '../create_query_resource';

describe('createQueryResource', () => {
  afterEach(cleanup);

  test('show fallback while pending', async () => {
    const defer = createDefer<any, unknown>();
    const controlledQuery = createQuery({ handler: () => defer.promise });

    const scope = fork();

    const boundStart = scopeBind(controlledQuery.start, { scope });

    function App() {
      const [data] = createQueryResource(controlledQuery);

      return (
        <Suspense fallback="Loading">
          <p>{data()}</p>
        </Suspense>
      );
    }

    render(() => (
      <Provider value={scope}>
        <App />
      </Provider>
    ));

    boundStart({});

    const loadingText = await screen.findByText('Loading');
    expect(loadingText).toBeInTheDocument();

    defer.resolve('Hello');
    await allPrevSettled(scope);

    const helloText = await screen.findByText('Hello');
    expect(helloText).toBeInTheDocument();
  });

  test('show fallback while second pending', async () => {
    const controlledQuery = createQuery({
      handler: () => setTimeout(100).then(() => 'Hello'),
    });

    const scope = fork();

    const boundStart = scopeBind(controlledQuery.start, { scope });

    function App() {
      const [data] = createQueryResource(controlledQuery);

      return (
        <Suspense fallback="Loading">
          <p>{data()}</p>
        </Suspense>
      );
    }

    render(() => (
      <Provider value={scope}>
        <App />
      </Provider>
    ));

    boundStart({});

    const loadingText = await screen.findByText('Loading');
    expect(loadingText).toBeInTheDocument();

    await allPrevSettled(scope);

    const helloText = await screen.findByText('Hello');
    expect(helloText).toBeInTheDocument();

    boundStart({});
    expect(loadingText).toBeInTheDocument();

    await allPrevSettled(scope);
    expect(helloText).toBeInTheDocument();
  });

  test('show error boundry when query failed', async () => {
    const defer = createDefer<any, unknown>();
    const controlledQuery = createQuery({ handler: () => defer.promise });

    const scope = fork();

    const boundStart = scopeBind(controlledQuery.start, { scope });

    function App() {
      const [data] = createQueryResource(controlledQuery);

      return (
        <Suspense fallback="Loading">
          <ErrorBoundary fallback={(error) => `Error: ${error}`}>
            <p>{data()}</p>
          </ErrorBoundary>
        </Suspense>
      );
    }

    render(() => (
      <Provider value={scope}>
        <App />
      </Provider>
    ));

    boundStart({});

    defer.reject('WOW');
    await allPrevSettled(scope);

    const errorText = await screen.findByText('Error: WOW');
    expect(errorText).toBeInTheDocument();
  });

  test('DO NOT show loading when query skipped', async () => {
    const controlledQuery = createQuery({
      enabled: false,
      handler: async () => 'Hello',
    });

    const scope = fork();

    function App() {
      const [data] = createQueryResource(controlledQuery);

      return (
        <Suspense fallback="Loading">
          <ErrorBoundary fallback={(error) => `Error: ${error}`}>
            <p>Weird situation</p>
            <p>{data()}</p>
          </ErrorBoundary>
        </Suspense>
      );
    }

    render(() => (
      <Provider value={scope}>
        <App />
      </Provider>
    ));

    await allSettled(controlledQuery.start, { scope, params: {} });

    const insideText = await screen.findByText('Weird situation');
    expect(insideText).toBeInTheDocument();
  });

  test('show Suspense-fallback while pending and nested data', async () => {
    const defer = createDefer<any, unknown>();
    const controlledQuery = createQuery<void, { name: string }>({
      handler: () => defer.promise,
    });

    const scope = fork();

    const boundStart = scopeBind(controlledQuery.start, { scope });

    function App() {
      const [user] = createQueryResource(controlledQuery);

      return (
        <Suspense fallback="Loading">
          <p>{user()?.name}</p>
        </Suspense>
      );
    }

    render(() => (
      <Provider value={scope}>
        <App />
      </Provider>
    ));

    boundStart();

    const loadingText = await screen.findByText('Loading');
    expect(loadingText).toBeInTheDocument();
  });

  test('should work with two scopes', async () => {
    const controlledQuery = createQuery({
      handler: async ({ timeout, text }: { timeout: number; text: string }) =>
        setTimeout(timeout).then(() => text),
    });

    const correctScope = fork();
    const wrongScope = fork();

    function App() {
      const [data] = createQueryResource(controlledQuery);

      return (
        <Suspense fallback="Loading">
          <p>{data()}</p>
        </Suspense>
      );
    }

    render(() => (
      <Provider value={correctScope}>
        <App />
      </Provider>
    ));

    // Start long Query in correct scope
    allSettled(controlledQuery.start, {
      scope: correctScope,
      params: { timeout: 1000, text: 'Corrent' },
    });

    // Start short Query in wrong scope
    allSettled(controlledQuery.start, {
      scope: wrongScope,
      params: { timeout: 0, text: 'Wrong' },
    });

    // Wait for shortQuery done
    await setTimeout(10);

    // Query finished in wrong scope, correct scoped query still in progress
    expect(correctScope.getState(controlledQuery.$pending)).toBeTruthy();
    expect(wrongScope.getState(controlledQuery.$pending)).toBeFalsy();

    // Conponent bound to the correct scope
    const loadingText = await screen.findByText('Loading');
    expect(loadingText).toBeInTheDocument();

    await allPrevSettled(correctScope);
    await allPrevSettled(wrongScope);
  });

  test('should update when query restarted', async () => {
    const items = [1];

    const query = createQuery({
      handler: async (x: void) => [...items],
    });

    const mutation = createMutation({
      handler: async (x: void) => items.push(2),
    });

    sample({
      clock: mutation.finished.success,
      target: query.start,
    });

    const scope = fork();

    const App = () => {
      const [resource] = createQueryResource(query);

      return <For each={resource()}>{(item) => <span>{item}</span>}</For>;
    };

    render(() => (
      <Provider value={scope}>
        <App />
      </Provider>
    ));

    await allSettled(query.start, {
      scope,
    });

    expect(await screen.findByText(1)).toBeInTheDocument();

    await allSettled(mutation.start, {
      scope,
    });

    expect(await screen.findByText(2)).toBeInTheDocument();
  });
});
