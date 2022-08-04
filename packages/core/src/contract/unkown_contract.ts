import { Contract } from './type';

const unkownContract: Contract<unknown, unknown, unknown> = {
  isData: (raw): raw is unknown => true,
  isError: (raw): raw is unknown => false,
  getValidationErrors: () => [],
};

export { unkownContract };
