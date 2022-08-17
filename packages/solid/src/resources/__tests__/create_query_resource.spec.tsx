/**
 * @jest-environment jsdom
 */

import { fork, scopeBind } from 'effector';
import { Suspense } from 'solid-js/web';
import { render, cleanup, screen } from 'solid-testing-library';
import { Provider } from 'effector-solid/scope';
import { createQuery } from '@farfetched/core';
import { allPrevSettled } from '@farfetched/test-utils';
import { setTimeout } from 'timers/promises';

import { createDefer, createQueryResource } from '../create_query_resource';

describe('createQueryResource', () => {
  afterEach(cleanup);

  test('show fallback while pending', async () => {
    const defer = createDefer();
    const controlledQuery = createQuery({ handler: () => defer.req });

    const scope = fork();

    const boundStart = scopeBind(controlledQuery.start, { scope });

    function App() {
      const { data } = createQueryResource(controlledQuery);

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

    defer.rs('Hello');
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
      const { data } = createQueryResource(controlledQuery);

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
});
