/**
 * @jest-environment jsdom
 */

import { fork, scopeBind } from 'effector';
import { createQuery } from '@farfetched/core';
import { Suspense } from 'solid-js/web';
import { render, cleanup, screen } from 'solid-testing-library';
import { Provider } from 'effector-solid/scope';

import { createDefer, createQueryResource } from '../create_query_resource';

describe('createQueryResource', () => {
  afterEach(cleanup);

  test('show fallback while pending', async () => {
    const defer = createDefer();
    const controlledQuery = createQuery({ handler: () => defer.req });

    const scope = fork();

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

    scopeBind(controlledQuery.start, { scope })({});

    const loadingText = await screen.findByText('Loading');
    expect(loadingText).toBeInTheDocument();

    defer.rs('Hello');

    const helloText = await screen.findByText('Hello');
    expect(helloText).toBeInTheDocument();
  });
});
