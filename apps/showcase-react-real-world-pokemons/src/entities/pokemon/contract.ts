import { obj, num, str } from '@withease/contracts';

import { EntityLink } from '../../shared/entity_link';

export const Pokemon = obj({
  id: num,
  name: str,
  height: num,
  weight: num,
  sprites: obj({ front_default: str }),
  species: EntityLink,
});

export const Species = obj({
  id: num,
  name: str,
  color: EntityLink,
  generation: EntityLink,
});
