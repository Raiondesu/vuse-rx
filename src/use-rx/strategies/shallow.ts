export type ShallowMutation<S> = {
  // Hack to avoid double `undefined` in `[key]?: value | undefined`
  [K in keyof Partial<S>]: S[K];
};

/**
 * A merge strategy for mutations
 *
 * Shallow-merges state and mutation recursively,
 * by enumerable keys (`for..in`)
 */
 export const shallow = <S extends Record<PropertyKey, any>>(
  state: S
) => (
  mutation: ShallowMutation<S>
) => {
  for (const key in mutation) {
    state[key] = mutation[key];
  }

  return state;
};
