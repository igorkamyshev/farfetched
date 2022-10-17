import { Number, Record, String } from 'runtypes';

import { Url } from '../../shared/url';

export const PokemonLink = Record({
  name: String,
  url: Url,
});

export const Pokemon = Record({
  id: Number,
  name: String,
  height: Number,
  weight: Number,
  sprites: Record({ front_default: Url }),
});
