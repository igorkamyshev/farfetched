import { Store } from 'effector';
import { SourcedField } from './sourced';
import { ParamsDeclaration } from '../../remote_operation/params';

export type PartialStore<Data, Result> = (
  declaration: ParamsDeclaration<Data>
) => Store<(params: Data) => Result>;

export function sourced<Params, Result, Source>(
  _config: SourcedField<Params, Result, Source>
): PartialStore<Params, Result> {
  return {} as any;
}
