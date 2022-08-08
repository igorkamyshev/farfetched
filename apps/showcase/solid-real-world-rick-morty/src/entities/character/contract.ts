import { Array, Literal, Record, String, Union } from 'runtypes';

import { Id } from '../../shared/id';
import { Url } from '../../shared/url';

const UnknownLiteral = Literal('unknown');

const Status = Union(Literal('Alive'), Literal('Dead'), UnknownLiteral);

const Gender = Union(
  Literal('Female'),
  Literal('Male'),
  Literal('Genderless'),
  UnknownLiteral
);

const LocationLink = Record({ name: String, url: Url });

const Character = Record({
  id: Id,
  name: String,
  status: Status,
  species: String,
  type: String,
  gender: Gender,
  origin: LocationLink,
  location: LocationLink,
  image: Url,
  episode: Array(Url),
});

export { Character };
