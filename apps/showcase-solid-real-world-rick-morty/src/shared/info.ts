import { Number, Record, Static } from 'runtypes';

import { Url } from './url';

const Info = Record({
  count: Number,
  pages: Number,
  next: Url.nullable(),
  prev: Url.nullable(),
});

type TInfo = Static<typeof Info>;

export { Info, type TInfo };
