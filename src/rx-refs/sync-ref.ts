import { Ref, UnwrapRef, ref, watch, WatchOptions } from 'vue';

/**
 * Creates a binding between two refs.\
 * The binding can be:
 * - One-way if only the one mapper is defined.
 * - Two-way if both mappers (`to` and `from`) are defined.
 *
 * The resulting ref serves as an origin point for the binding,\
 * values **from** the resulting ref and **to** the resulting ref are mapped onto it.
 */
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, UnwrapRef<R2>>,
  defaultValue?: R2,
): Ref<UnwrapRef<R2>>;

/**
 * Creates a binding between two refs.\
 * The binding can be:
 * - One-way if only the one mapper is defined.
 * - Two-way if both mappers (`to` and `from`) are defined.
 *
 * The resulting ref serves as an origin point for the binding,\
 * values **from** the resulting ref and **to** the resulting ref are mapped onto it.
 */
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, UnwrapRef<R2>>,
): Ref<UnwrapRef<R2>>;

/**
 * Creates a binding between two refs.\
 * The binding can be:
 * - One-way if only the one mapper is defined.
 * - Two-way if both mappers (`to` and `from`) are defined.
 *
 * The second ref serves as an origin point for the binding,\
 * values **from** the second ref and **to** the second ref are mapped onto it.
 */
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, R2>,
  ref2: Ref<R2>,
): Ref<R2>;
export function syncRef<R1, R2>(
  this: WatchOptions,
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, R2>,
  _ref2?: Ref<R2> | R2,
): Ref<R2> {
  const ref2 = ref(_ref2 ?? ref1.value) as Ref<R2>;

  if (to) {
    watch(ref1, v => ref2.value = to(v), this);
  }

  if (from) {
    watch(ref2, v => ref1.value = from(v), this);
  }

  return ref2;
}

syncRef.with = <T extends Readonly<boolean> = false>(
  options: WatchOptions<T>
): typeof syncRef => syncRef.bind(options);

type Mapper<F, T> = (value: F) => T;

type Mappers<R1, R2> = {
  /**
   * A map from the first ref to the second
   */
  to: Mapper<R1, R2>,

  /**
   * A map from the second ref to the first
   */
  from?: Mapper<R2, R1>,
} | {
  /**
   * A map from the first ref to the second
   */
  to?: Mapper<R1, R2>,

  /**
   * A map from the second ref to the first
   */
  from: Mapper<R2, R1>,
};
