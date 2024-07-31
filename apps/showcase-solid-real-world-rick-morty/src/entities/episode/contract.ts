import { arr, num, obj, str } from '@withease/contracts';

export const Episode = obj({
  id: num,
  name: str,
  air_date: str,
  episode: str,
  characters: arr(str),
});
