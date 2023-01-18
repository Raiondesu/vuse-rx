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

export type MutationStrategy<S extends Record<PropertyKey, any>, M> = {
  /**
   * Creates a mutation applier
   *
   * @param state - a base state to mutate
   * @param strategy - current mutation strategy
   */
  (state: S, strategy: MutationStrategy<S, M>): (mutation: M) => S;
};

/**
 * Checks if it's possible to advance deeper
 * into the sibling object structures,
 * with one being partial
 *
 * @param state - the object source
 * @param mutation - the main checking reference
 * @param key - a key into which to advance
 */
export const canMergeDeep = <S extends Record<PropertyKey, any>, Mutation extends Record<keyof S, any>>(
  state: S,
  mutation: Mutation | null | undefined,
  key: keyof S,
) => (
  mutation != null
  && typeof mutation[key] === 'object'
  && typeof state[key] === 'object'
);
