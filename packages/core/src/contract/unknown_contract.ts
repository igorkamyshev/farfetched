import { Contract } from './type';

const unknownContract: Contract<unknown, unknown> = {
  isData: (raw): raw is unknown => true,
  getErrorMessages: () => [],
};

export { unknownContract };
