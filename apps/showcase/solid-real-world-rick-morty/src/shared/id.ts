import { Number, Static } from 'runtypes';

import { Url } from './url';

const Id = Number.withBrand('Id');

function urlToId(url: Static<typeof Url>): Static<typeof Id> {
  return parseInt(url.split('/').at(-1) ?? '', 10) as Static<typeof Id>;
}
export { urlToId, Id };
