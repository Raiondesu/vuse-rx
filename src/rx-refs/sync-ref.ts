import { Ref, UnwrapRef, ref, watch, WatchOptions, WatchStopHandle } from 'vue';

/**
 * Creates a binding between two refs.\
 * The binding can be:
 * - One-way if only the one mapper is defined.
 * - Two-way if both mappers (`to` and `from`) are defined.
 *
 * The resulting ref serves as an origin point for the binding,\
 * values **from** the resulting ref and **to** the resulting ref are mapped onto the first.
 */
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to }: { to: Mapper<R1, UnwrapRef<R2>> },
): SyncedRef<R1, 'to', UnwrapRef<R2>>;

export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { from }: { from: Mapper<UnwrapRef<R2>, R1> },
  defaultValue?: R2,
): SyncedRef<R1, 'from', UnwrapRef<R2>>;

export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: { to: Mapper<R1, UnwrapRef<R2>>, from: Mapper<UnwrapRef<R2>, R1> },
): SyncedRef<R1, 'to' | 'from', UnwrapRef<R2>>;

/**
 * Creates a binding between two refs.\
 * The binding can be:
 * - One-way if only the one mapper is defined.
 * - Two-way if both mappers (`to` and `from`) are defined.
 *
 * The resulting ref serves as an origin point for the binding,\
 * values **from** the resulting ref and **to** the resulting ref are mapped onto the first.
 */
export function syncRef<R1, R2, M extends Readonly<Mappers<R1, R2>> = Mappers<R1, R2>>(
  ref1: Ref<R1>,
  { to, from }: M,
  defaultValue?: R2,
): SyncedRef<R1, keyof M, UnwrapRef<R2>>;

/**
 * Creates a binding between two refs.\
 * The binding can be:
 * - One-way if only the one mapper is defined.
 * - Two-way if both mappers (`to` and `from`) are defined.
 *
 * The second ref serves as an origin point for the binding,\
 * values **from** the second ref and **to** the second ref are mapped onto the first.
 */
export function syncRef<R1, R2, M extends Readonly<Mappers<R1, R2>> = Mappers<R1, R2>>(
  ref1: Ref<R1>,
  { to, from }: M,
  ref2: Ref<R2>,
): SyncedRef<R1, keyof M, R2>;

export function syncRef<R1, R2>(
  this: WatchOptions,
  ref1: Ref<R1>,
  maps: Mappers<R1, R2>,
  _ref2?: Ref<R2> | R2,
): _SyncedRef<R1, keyof Mappers<R1, R2>, R2> {
  const ref2 = ref(
    _ref2 == null
      ? maps.to
        ? maps.to(ref1.value)
        : ref1.value
      : _ref2
  ) as _SyncedRef<R1, keyof Mappers<R1, R2>, R2>;

  for (const key in maps) (
    ref2[key as keyof typeof maps] = bind(ref1, ref2, maps, key as any, this)
  ).bind();

  return ref2;
}

syncRef.with = <T extends Readonly<boolean> = false>(
  ...options: WatchOptions<T>[]
): typeof syncRef => {
  const opts = Object.assign({}, ...options);
  const f = syncRef.bind(opts);
  f.with = syncRef.with.bind(opts);
  return f;
}

const bind = <R1, R2>(
  refBase: Ref<R1>,
  refDest: _SyncedRef<R1, keyof Mappers<R1, R2>, R2>,
  maps: Mappers<R1, R2>,
  dir: keyof Mappers<R1, R2>,
  options: WatchOptions,
) => ({
  bind: (bindOptions?: Partial<BindingOptions<R1, R2, keyof Mappers<R1, R2>>>) => {
    const {
      ref, map, watch: opts
    }: BindingOptions<any, R2, any> = {
      ref: refBase,
      map: maps[dir]!,
      watch: options,
      ...bindOptions,
    };

    refDest[dir]!.stop();

    refDest[dir]!.stop = dir === 'to'
      ? watch(ref, v => refDest.value = map(v), Object.assign({}, options, opts))
      : watch(refDest, v => ref.value = map(v), Object.assign({}, options, opts));
  },
  stop: () => {}
});

type Mapper<F, T> = (value: F) => T;

type Mappers<R1, R2> = {
  /**
   * A map from the first ref to the second
   */
  to: Mapper<R1, R2>,

  /**
   * A map from the second ref to the first
   */
  from?: never,
} | {
  /**
   * A map from the first ref to the second
   */
  to?: never,

  /**
   * A map from the second ref to the first
   */
  from: Mapper<R2, R1>,
} | {
  /**
   * A map from the first ref to the second
   */
  to: Mapper<R1, R2>,

  /**
   * A map from the second ref to the first
   */
  from: Mapper<R2, R1>,
};

type Binders<R1, R2, Keys extends PropertyKey> = {
  [key in Keys]: {
    /**
     * Cut the binding in this direction
     */
    stop: WatchStopHandle;
    bind: {
      /**
       * Reapply the binding in this direction
       */
      (): void;

      /**
       * Bind this direction to a new ref
       */
      (options?: BindingOptions<R1, R2, key>): void;

      /**
       * Bind this direction to a new ref with a new map
       */
      <T>(options: CustomBindingOptions<T, R2, key>): void;
    };
  };
};

export type BindingOptions<R1, R2, Key extends PropertyKey> = {
  ref?: Ref<R1>;
  map?: Key extends 'to' ? Mapper<R1, R2> : Mapper<R2, R1>;
  watch?: WatchOptions;
}

export type CustomBindingOptions<T, R2, Key extends PropertyKey> = {
  ref: Ref<T>;
  map: Key extends 'to' ? Mapper<T, R2> : Mapper<R2, T>;
  watch?: WatchOptions;
}

export type SyncedRef<
  R1,
  Keys extends PropertyKey,
  R2,
> = Ref<R2> & Binders<R1, R2, Keys>;

type _SyncedRef<
  R1,
  _Keys extends PropertyKey,
  R2,
> = Ref<R2> & Partial<Binders<R1, R2, keyof Mappers<R1, R2>>>;
