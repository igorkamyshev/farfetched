import { createRoute } from 'atomic-router';
import { Static } from 'runtypes';

import { Id } from '../../shared/id';

const locationRoute = createRoute<{ locationId: Static<typeof Id> }>();

export { locationRoute };
