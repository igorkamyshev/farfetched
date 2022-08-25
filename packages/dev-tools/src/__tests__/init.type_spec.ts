import { expectType } from 'tsd';

import { initDevTools } from '../index';

expectType<void>(initDevTools({}));
