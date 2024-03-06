import { createRoute } from 'atomic-router';

import { TId } from '../../shared/id';

const episodeRoute = createRoute<{ episodeId: TId }>();
const episodeListRoute = createRoute<{ page?: number }>();

export { episodeRoute, episodeListRoute };
