import { Number, Static } from 'runtypes';

import { TUrl } from './url';

const Id = Number.withBrand('Id');

type TId = Static<typeof Id>;

function urlToId(url: TUrl): TId {
  return parseInt(url.split('/').at(-1) ?? '', 10) as TId;
}
export { urlToId, Id, type TId };
