import { isRef, ref, Ref, toRef, UnwrapRef, watch, WatchSource } from 'vue';
import { tap } from 'rxjs/operators';
import { identity, Observable, OperatorFunction } from 'rxjs';
import { untilUnmounted } from './hooks/until';
import type { RxResult } from './use-rx';

export type RefsMap<O, Optional = false> = Record<string, (state: Optional extends true ? Readonly<O> | void | undefined : Readonly<O>) => any>;

export type RefsObj<T extends RefsMap<any>> = {
  [key in keyof T]: Ref<ReturnType<T[key]>>
};

/**
 * Creates refs and updates them once the observable is updated.
 *
 * Accepts an observable and a ref map.
 * Each record in the map corresponds to a newly created ref
 * and a rule on how to update it from a new value of the observable.
 *
 * @param observable
 * @param map a map of ref names and their update rules
 *
 * @returns [newly created refs, new obserable that updates the refs]
 */
export const tapRefs: {
  <O, T extends RefsMap<O, true>>(
    observable: Observable<O>,
    map: T
  ): { refs: RefsObj<T>, state$: Observable<O> };

  <O, T extends RefsMap<O>>(
    observable: Observable<O>,
    map: T,
    initialState: O
  ): { refs: RefsObj<T>, state$: Observable<O> };

  <O, T extends RefsMap<O, true>>(
    observable: Observable<O>,
    map: T,
    initialState?: O
  ): { refs: RefsObj<T>, state$: Observable<O> };
} = <O, T extends RefsMap<O, true>>(
  observable: Observable<O>,
  map: T,
  initialState?: O
): { refs: RefsObj<T>, state$: Observable<O> } => {
  const ops: OperatorFunction<O, O>[] = [];
  const refs = {} as RefsObj<T>;

  for (const key in map) {
    refs[key] = ref(map[key](initialState));

    ops.push(tap(state => refs[key].value = map[key](state)));
  }

  return {
    refs,
    state$: observable.pipe(...ops),
  };
}

/**
 * Creates refs and updates them once the rxState is updated.
 *
 * Accepts a value returned from useRxState and a ref map.
 * Each record in the map corresponds to a newly created ref
 * and a rule on how to update it from a new value of the observable.
 *
 * @param rxState a value returned from useRxState
 * @param map a map of ref names and their update rules
 */
export const useRxRefs = <O, R, T extends RefsMap<O>>(
  rxState: RxResult<R, O>,
  map: T,
): { refs: RefsObj<T> } & RxResult<R, O> => {
  const { actions, state, state$ } = rxState;
  const { refs, state$: newState$ } = tapRefs(state$, map, state);

  return {
    refs,
    actions,
    state,
    state$: newState$,
  };
};

/**
 * Creates an observable from a vue ref.
 *
 * Each time a ref's value is changed - observable emits.
 *
 * Can also accept vue reactive objects and value factories.
 *
 * @param ref - a ref/reactive/factory to observe
 * @returns an observable that watches the ref
 */
export function fromRef<R>(ref: WatchSource<R>): Observable<R>;
export function fromRef<R extends Record<string, any>>(reactiveState: R): Observable<R>;
export function fromRef<R extends Record<string, any> | WatchSource<any>>(ref: R): Observable<R> {
  return untilUnmounted(
    new Observable<R>(ctx => watch(ref, value => ctx.next(value)))
  );
};

type Mapper<F, T> = (value: F) => T;

type Mappers<R1, R2> = {
  /**
   * A map from the first ref to the second
   */
  to: Mapper<R1, R2>,

  /**
   * A map from the second ref to the first
   *
   * It will create a two-way bind between the refs
   */
  from?: Mapper<R2, R1>,
};

/**
 * Defines a one-way binding from ref1 to ref2\
 * with an ability to convert value's type on-the-fly
 * @param ref1 the source of the binding
 * @param ref2 the destination of the binding
 * @param mapValue describes how to transform the value on ref1 update
 * @returns watch stop handle
 */
export const bindRefs = <R1, R2>(ref1: Ref<R1>, ref2: Ref<R2>, mapValue: Mapper<R1, R2>) =>
  watch(ref1, _ => ref2.value = mapValue(_));

/**
 * Creates a two-way bind with a ref.
 *
 * When a passed ref changes, so does the resulting ref
 *
 * @param ref1 an existing ref to bind
 * @returns a new ref bound to the passed one
 */
export function syncRef<R>(
  ref1: Ref<R>,
): Ref<R>;

/**
 * Creates a binding between two refs.
 *
 * The binding can be:
 * - One-way if only the `to` mapper is defined.
 * - Two-way if both `to` and `from` mappers are defined
 *
 * The first ref serves as an origin point for the transformation,\
 * values **from** the second ref and **to** the second ref are mapped from it
 *
 * @param ref1 an origin point for the transformation,\
 * values **from** the second ref and **to** the second ref are mapped from it
 * @param map a transformer map from one ref to another
 * @param ref2 an existing ref to bind
 * @returns ref2
 */
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  map: Mappers<R1, R2>,
  ref2: Ref<R2>,
): Ref<R2>;

/**
 * Creates a ref that is bound to the passed ref.
 *
 * The binding can be:
 * - One-way if only the `to` mapper is defined.
 * - Two-way if both `to` and `from` mappers are defined
 *
 * The ref serves as an origin point for the transformation,\
 * values **from** the second ref and **to** the second ref are mapped from it
 *
 * @param ref1 an origin point for the transformation,\
 * values **from** the second ref and **to** the second ref are mapped from it
 * @param map a transformer map from one ref to another
 * @param defaultValue for the new ref
 * @returns a new ref with defaultValue
 */
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  map: Mappers<R1, UnwrapRef<R2>>,
  defaultValue?: R2,
): Ref<UnwrapRef<R2>>;
export function syncRef<R1, R2 = R1>(
  ref1: Ref<R1>,
  map?: Mappers<R1, R2>,
  _ref2?: Ref<R2> | R2,
): Ref<R2> {
  const ref2 = <Ref<R2>> ref(_ref2 ?? map?.to?.(ref1.value) ?? ref1.value);

  bindRefs(ref1, ref2, map?.to ?? identity as Mapper<R1, R2>);

  if (!map || map?.from) {
    bindRefs(ref2, ref1, map?.from ?? identity as Mapper<R2, R1>);
  }

  return ref2;
}
