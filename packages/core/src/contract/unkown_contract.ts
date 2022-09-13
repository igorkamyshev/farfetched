import { Contract } from './type';

const unkownContract: Contract<unknown, unknown> = {
  isData: (raw): raw is unknown => true,
  getErrorMessages: () => [],
};

export { unkownContract };
