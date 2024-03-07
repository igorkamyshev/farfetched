import { createRoute } from 'atomic-router';

import { TId } from '../../shared/id';

const locationRoute = createRoute<{ locationId: TId }>();

export { locationRoute };
