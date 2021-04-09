
export type ShallowMutation<S> = Partial<S>;

/**
 * A merge strategy for mutations
 *
 * Shallow-merges state and mutation recursively,
 * by enumerable keys (`for..in`)
 */
 export const shallow = <S extends Record<PropertyKey, any>>(
  state: S
) => (
  mutation: Partial<S>
) => ({ ...state, ...mutation });
