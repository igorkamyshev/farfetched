import { Record, String } from 'runtypes';

import { Url } from './url';

export const EntityLink = Record({
  name: String,
  url: Url,
});
