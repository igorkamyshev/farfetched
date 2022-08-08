import { Number, Record } from 'runtypes';

import { Url } from './url';

const Info = Record({
  count: Number,
  pages: Number,
  next: Url.nullable(),
  prev: Url.nullable(),
});

export { Info };
