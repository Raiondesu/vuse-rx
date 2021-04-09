import { Builtin, canMergeDeep, DeepPartial } from '../common';

export type ShallowArrayMutation<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<U>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<U>
  : T extends Record<any, any>
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

/**
 * Default merge strategy for mutations
 *
 * Deep-merges state and mutation recursively,
 * by enumerable keys (`for..in`),
 * but replaces arrays
 */
 export const shallowArray = <S extends Record<PropertyKey, any>>(
  state: S
) => (
  mutation: ShallowArrayMutation<S>
) => {
  for (const key in mutation) {
    const submutation = mutation[key];

    state[key as keyof S] = !Array.isArray(submutation) && canMergeDeep(state, mutation, key)
      ? shallowArray(state[key])(submutation)
      : submutation as S[keyof S];
  }

  return state;
};
