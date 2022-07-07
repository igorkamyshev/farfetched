import { Contract } from './type';

const unkownContract: Contract<unknown, unknown, unknown> = {
  data: { validate: () => null, extract: (p) => p },
  error: { is: () => false, extract: (p) => p },
};

export { unkownContract };
