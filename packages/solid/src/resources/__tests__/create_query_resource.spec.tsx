/**
 * @jest-environment jsdom
 */

import { createQuery } from '@farfetched/core';
import { Suspense } from 'solid-js/web';
import { render, cleanup, screen } from 'solid-testing-library';

import { createDefer, createQueryResource } from '../create_query_resource';

describe('createQueryResource', () => {
  afterEach(cleanup);

  test('show fallback while pending', async () => {
    const defer = createDefer();
    const controlledQuery = createQuery({ handler: () => defer.req });

    controlledQuery.start();

    function App() {
      const { data } = createQueryResource(controlledQuery);

      return (
        <Suspense fallback="Loading">
          <p>{data()}</p>;
        </Suspense>
      );
    }

    render(() => <App />);

    const loadingText = await screen.findByText('Loading');

    expect(loadingText).toBeInTheDocument();
  });
});
