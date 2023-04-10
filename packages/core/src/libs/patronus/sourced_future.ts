import { Store } from 'effector';
import { SourcedField } from './sourced';

export type PartialStore<Data, Result> = Store<(params: Data) => Result>;

export function sourced<Params, Result, Source>(
  _config: SourcedField<Params, Result, Source>
): PartialStore<Params, Result> {
  return {} as any;
}
