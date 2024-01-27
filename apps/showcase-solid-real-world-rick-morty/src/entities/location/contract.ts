import { Array, Record, String } from 'runtypes';

import { Id } from '../../shared/id';
import { Url } from '../../shared/url';

const Location = Record({
  id: Id,
  name: String,
  type: String,
  dimension: String,
  residents: Array(Url),
});

export { Location };
