import { createRoute } from 'atomic-router';

import { TId } from '../../shared/id';

const characterRoute = createRoute<{ characterId: TId }>();
const characterListRoute = createRoute<{ page?: number }>();

export { characterRoute, characterListRoute };
