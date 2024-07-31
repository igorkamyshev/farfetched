import { arr, obj, num, str } from '@withease/contracts';

export const Location = obj({
  id: num,
  name: str,
  type: str,
  dimension: str,
  residents: arr(str),
});
