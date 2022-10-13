import { Event, sample } from 'effector';
import { CacheAdapterInstance, CacheAdapterOptions } from './type';

export function attachObservability({
  adapter,
  options,
  events,
}: {
  adapter: CacheAdapterInstance;
  options?: CacheAdapterOptions['observability'];
  events: {
    itemExpired: Event<{ key: string; value: string }>;
    itemEvicted: Event<{ key: string }>;
  };
}) {
  if (options?.hit) {
    sample({
      clock: adapter.get.done,
      filter: ({ result }) => result !== null,
      fn: ({ params }) => ({ key: params.key }),
      target: options.hit,
    });
  }

  if (options?.miss) {
    sample({
      clock: adapter.get.done,
      filter: ({ result }) => result === null,
      fn: ({ params }) => ({ key: params.key }),
      target: options.miss,
    });
  }

  if (options?.expired) {
    sample({
      clock: events.itemExpired,
      fn: ({ key }) => ({ key }),
      target: options.expired,
    });
  }

  if (options?.evicted) {
    sample({
      clock: events.itemEvicted,
      fn: ({ key }) => ({ key }),
      target: options.evicted,
    });
  }
}
