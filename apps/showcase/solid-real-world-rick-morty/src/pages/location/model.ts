import { createRoute } from 'atomic-router';
import { sample } from 'effector';
import { locationQuery } from '../../entities/location';

const locationRoute = createRoute<{ locationId: number }>();

sample({
  clock: locationRoute.opened,
  fn({ params }) {
    return params;
  },
  target: locationQuery.start,
});

export { locationRoute };
