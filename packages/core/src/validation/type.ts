import { type DynamicallySourcedField } from '../libs/patronus';

type ValidationResult = boolean | string | string[];

type Validator<Data, Params, ValidationSource> = DynamicallySourcedField<
  { result: Data; params: Params },
  ValidationResult,
  ValidationSource
>;

export { Validator, ValidationResult };
