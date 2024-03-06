import { Array, Record, String } from 'runtypes';

import { Id } from '../../shared/id';
import { Url } from '../../shared/url';

const Episode = Record({
  id: Id,
  name: String,
  air_date: String,
  episode: String,
  characters: Array(Url),
});

export { Episode };
