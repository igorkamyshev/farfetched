import { Callback, CallbackWithSource } from '../misc/sourced';

type ValidationResult = boolean | string | string[];

type Validator<Data, Params, ValidationSource> =
  | Callback<{ result: Data; params: Params }, ValidationResult>
  | CallbackWithSource<
      { result: Data; params: Params },
      ValidationResult,
      ValidationSource
    >;

export { Validator, ValidationResult };
