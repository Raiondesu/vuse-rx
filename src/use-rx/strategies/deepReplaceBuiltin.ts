import { canMergeDeep } from './common';

export type Builtin =
  | Function
  | Array<any>
  | ReadonlyArray<any>
  | Date
  | Error
  | RegExp
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null;

export type BuiltinConstructors = Array<new (...args: any) => any>;

export const defaultBuiltin: BuiltinConstructors = [
  Array,
  Date,
  RegExp,
  Error,
];

export type DeepReplaceBuiltinMutation<T> = T extends Builtin
  ? T
  : T extends Record<any, any>
  ? { [K in keyof Partial<T>]: DeepReplaceBuiltinMutation<T[K]> }
  : Partial<T>;

/**
 * Default merge strategy for mutations
 *
 * Deep-merges state and mutation objects recursively,
 * by enumerable keys (`for..in`),
 * but replaces builtin types (supplied by `this` context) and primitives
 */
export function deepReplaceBuiltin<S extends Record<PropertyKey, any>>(
  this: BuiltinConstructors,
  state: S
) {
  return (mutation: DeepReplaceBuiltinMutation<S>) => {
    for (const key in mutation) {
      const submutation = mutation[key];

      state[key as keyof S] = (
        canMergeDeep(state, mutation, key)
        && !this.some(c => [state[key].constructor, submutation.constructor].includes(c))
      )
        ? deepReplaceBuiltin.call(this, state[key])(submutation) as S[keyof S]
        : submutation as S[keyof S];
    }

    return state;
  };
}
