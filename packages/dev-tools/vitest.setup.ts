import { beforeEach } from 'vitest';

import { declarations } from './src/services/storage';

beforeEach(() => {
  // declarations is global, we have to clear it before each test
  declarations.splice(0, declarations.length);
});
