import { canMergeDeep } from './common';

export type DeepMutation<T> = T extends object
  ? T extends Array<infer U>
  ? Array<DeepMutation<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepMutation<U>>
  : T extends Record<any, any>
  ? { [K in keyof Partial<T>]: DeepMutation<T[K]> }
  : Partial<T>
  : T;

/**
 * A deep-merge strategy for mutations
 *
 * Deep-merges state and mutation recursively,
 * by enumerable keys (`for..in`),
 * so avoid recursive object links
 */
export const deep = <S extends Record<PropertyKey, any>>(
  state: S
) => (
  mutation: DeepMutation<S>
) => {
  for (const key in mutation) {
    state[key as keyof S] = canMergeDeep(state, mutation, key)
      ? deep(state[key])(mutation[key])
      : mutation[key] as S[keyof S];
  }

  return state;
};
