import { canMergeDeep } from '../common';

export type Builtin =
  | Function
  | Date
  | Error
  | RegExp
  | Uint8Array
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends Record<any, any>
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

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
  mutation: DeepMutation<S>
) => {
  for (const key in mutation) {
    state[key as keyof S] = canMergeDeep(state, mutation, key)
      ? deep(state[key])(mutation[key])
      : mutation[key] as S[keyof S];
  }

  return state;
};
