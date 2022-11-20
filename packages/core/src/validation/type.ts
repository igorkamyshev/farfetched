import { type DynamicallySourcedField } from '../libs/patronus';

export type ValidationResult = boolean | string | string[];

export type Validator<Data, Params, ValidationSource> = DynamicallySourcedField<
  { result: Data; params: Params },
  ValidationResult,
  ValidationSource
>;
