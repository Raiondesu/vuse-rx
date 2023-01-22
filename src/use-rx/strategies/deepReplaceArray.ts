import { deepReplaceBuiltin } from './deepReplaceBuiltin';

export type DeepReplaceArrayMutation<T> = T extends Array<any> | ReadonlyArray<any>
  ? T
  : T extends Record<any, any>
  ? { [K in keyof Partial<T>]: DeepReplaceArrayMutation<T[K]> }
  : Partial<T>;

/**
 * Deep-merges state and mutation objects recursively,
 * by enumerable keys (`for..in`),
 * but replaces arrays and primitives
 *
 * @deprecated in favor of `deepReplaceBuiltin`
 */
export const deepReplaceArray = <S extends Record<PropertyKey, any>>(
  state: S
) => (
  mutation: DeepReplaceArrayMutation<S>
): S => deepReplaceBuiltin.apply([Array], [state])(mutation);
