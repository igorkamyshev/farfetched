import { createRoute } from 'atomic-router';
import { Static } from 'runtypes';

import { Id } from '../../shared/id';

const episodeRoute = createRoute<{ episodeId: Static<typeof Id> }>();
const episodeListRoute = createRoute<{ page?: number }>();

export { episodeRoute, episodeListRoute };
