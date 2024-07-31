import { val, or, num, obj, type UnContract, str } from '@withease/contracts';

export const Info = obj({
  count: num,
  pages: num,
  next: or(str, val(null)),
  prev: or(str, val(null)),
});

export type TInfo = UnContract<typeof Info>;
