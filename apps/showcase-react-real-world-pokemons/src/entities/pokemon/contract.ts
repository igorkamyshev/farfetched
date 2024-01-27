import { Number, Record, String } from 'runtypes';

import { EntityLink } from '../../shared/entity_link';
import { Id } from '../../shared/id';
import { Url } from '../../shared/url';

export const Pokemon = Record({
  id: Id,
  name: String,
  height: Number,
  weight: Number,
  sprites: Record({ front_default: Url }),
  species: EntityLink,
});

export const Species = Record({
  id: Id,
  name: String,
  color: EntityLink,
  generation: EntityLink,
});
