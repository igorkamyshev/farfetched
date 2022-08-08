import { createRoute } from 'atomic-router';
import { Static } from 'runtypes';

import { Id } from '../../shared/id';

const characterRoute = createRoute<{ characterId: Static<typeof Id> }>();
const characterListRoute = createRoute<{ page?: number }>();

export { characterRoute, characterListRoute };
