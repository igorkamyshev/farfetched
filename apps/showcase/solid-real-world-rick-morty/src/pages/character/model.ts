import { createRoute } from 'atomic-router';
import { sample } from 'effector';

import { characterQuery } from '../../entities/character/api';

const characterRoute = createRoute<{ characterId: number }>();

sample({
  clock: characterRoute.opened,
  fn: ({ params }) => params,
  target: characterQuery.start,
});

export { characterRoute };
