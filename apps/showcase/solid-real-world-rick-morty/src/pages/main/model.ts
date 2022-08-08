import { createRoute } from 'atomic-router';
import { sample } from 'effector';

import { characterListQuery } from '../../entities/character';

const mainRoute = createRoute<{ page?: number }>();

const $currentPage = mainRoute.$params.map((params) => params.page ?? 1);

sample({
  clock: [mainRoute.opened, mainRoute.updated],
  source: $currentPage,
  fn(currentPage) {
    return { page: currentPage };
  },
  target: characterListQuery.start,
});

export { mainRoute, $currentPage };
