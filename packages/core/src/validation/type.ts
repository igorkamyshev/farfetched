import { TwoArgsSourcedField } from '../misc/sourced';

type ValidationResult = boolean | string | string[];

type Validator<Data, Params, ValidationSource> = TwoArgsSourcedField<
  Data,
  Params,
  ValidationResult,
  ValidationSource
>;

export { Validator, ValidationResult };
