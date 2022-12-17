import { Contract } from './type';

export const unknownContract: Contract<unknown, unknown> = {
  isData: (raw): raw is unknown => true,
  getErrorMessages: () => [],
};
