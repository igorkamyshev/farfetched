import { arr, val, obj, str, or, num } from '@withease/contracts';

const UnknownLiteral = val('unknown');

const Status = or(val('Alive'), val('Dead'), UnknownLiteral);

const Gender = or(
  val('Female'),
  val('Male'),
  val('Genderless'),
  UnknownLiteral
);

const LocationLink = obj({ name: str, url: str });

export const Character = obj({
  id: num,
  name: str,
  status: Status,
  species: str,
  type: str,
  gender: Gender,
  origin: LocationLink,
  location: LocationLink,
  episode: arr(str),
  image: str,
});
