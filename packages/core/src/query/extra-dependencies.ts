import { Store } from "effector";

/**
 * It should be possible to use any store as a source for a field.
 * Type of store value should be serializable (with stableStringify @see ../cache/lib/stable_stringify.ts)
 * But there is no way to express this in typescript without using `any` (`unknown` causes type errors)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SerializableAnyStore = Store<any>;
export type ExtraDependencies = SerializableAnyStore | SerializableAnyStore[];

export function normalizeExtraDependencies(extraDependencies?: ExtraDependencies): SerializableAnyStore[] | undefined {
  if(!extraDependencies) return undefined;

  if(Array.isArray(extraDependencies)) {
    return extraDependencies.filter(Boolean)
  }

  return (extraDependencies ? [extraDependencies] : []).filter(Boolean);
}
