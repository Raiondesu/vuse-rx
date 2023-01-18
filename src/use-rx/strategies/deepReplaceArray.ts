import { Builtin, canMergeDeep } from '../common';

export type DeepReplaceArrayMutation<T> = T extends Builtin | Array<any> | ReadonlyArray<any>
  ? T
  : T extends Record<any, any>
  ? { [K in keyof Partial<T>]: DeepReplaceArrayMutation<T[K]> }
  : Partial<T>;

/**
 * Default merge strategy for mutations
 *
 * Deep-merges state and mutation objects recursively,
 * by enumerable keys (`for..in`),
 * but replaces arrays and primitives
 */
export const deepReplaceArray = <S extends Record<PropertyKey, any>>(
  state: S
) => (
  mutation: DeepReplaceArrayMutation<S>
) => {
  for (const key in mutation) {
    const submutation = mutation[key];

    state[key as keyof S] = !Array.isArray(submutation) && canMergeDeep(state, mutation, key)
      ? deepReplaceArray(state[key])(submutation)
      : submutation as S[keyof S];
  }

  return state;
};
