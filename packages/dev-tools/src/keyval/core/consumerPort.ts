import { createEvent, createStore, split } from 'effector';
import type { ConsumerPort } from './types';

export function createConsumerPort(): ConsumerPort {
  const addConsumer = createEvent<number>();
  const removeConsumer = createEvent<number>();
  const activated = createEvent();
  const deactivated = createEvent();
  const $consumers = createStore<number[]>([]);
  const $active = $consumers.map((consumers) => consumers.length > 0);
  split({
    source: $active,
    match: (active) => (active ? 'activated' : 'deactivated'),
    cases: { activated, deactivated },
  });
  $consumers.on(addConsumer, (consumers, id) => {
    if (!consumers.includes(id)) return [...consumers, id];
    return undefined;
  });
  $consumers.on(removeConsumer, (consumers, id) => {
    if (consumers.includes(id)) {
      const result = [...consumers];
      result.splice(result.indexOf(id), 1);
      return result;
    }
    return undefined;
  });
  return {
    state: {
      active: $active,
      consumers: $consumers,
    },
    api: {
      addConsumer,
      removeConsumer,
      activated,
      deactivated,
    },
    consumersTotal: 0,
  };
}

export function getConsumerId(port: ConsumerPort) {
  port.consumersTotal += 1;
  return port.consumersTotal;
}

export function addAlwaysActivatedConsumer(port: ConsumerPort) {
  const consumerId = getConsumerId(port);
  port.api.addConsumer(consumerId);
}
