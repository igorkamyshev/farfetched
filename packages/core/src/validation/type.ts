import { TwoArgsDynamicallySourcedField } from '../misc/sourced';

type ValidationResult = boolean | string | string[];

type Validator<Data, Params, ValidationSource> = TwoArgsDynamicallySourcedField<
  Data,
  Params,
  ValidationResult,
  ValidationSource
>;

export { Validator, ValidationResult };
