import { canMergeDeep, DeepPartial } from '../common';

export type DeepMutation<S> = DeepPartial<S>;

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
  mutation: DeepPartial<S>
) => {
  for (const key in mutation) {
    state[key as keyof S] = canMergeDeep(state, mutation, key)
      ? deep(state[key])(mutation[key])
      : mutation[key] as S[keyof S];
  }

  return state;
};
