import { computed, ref, Ref, UnwrapRef, watch, WatchSource, WritableComputedRef } from 'vue';
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
} | {
  /**
   * A map from the first ref to the second
   */
  to?: Mapper<R1, R2>,

  /**
   * A map from the second ref to the first
   *
   * It will create a two-way bind between the refs
   */
  from: Mapper<R2, R1>,
};

export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, UnwrapRef<R2>>,
  defaultValue?: R2,
): Ref<UnwrapRef<R2>>;
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, UnwrapRef<R2>>,
): Ref<UnwrapRef<R2>>;
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, R2>,
  ref2: Ref<R2>,
): Ref<R2>;
export function syncRef<R1, R2>(
  ref1: Ref<R1>,
  { to, from }: Mappers<R1, R2>,
  _ref2?: Ref<R2> | R2,
): Ref<R2> {
  // Slight optimization if both mappers are defined
  if (to && from) {
    return computed({
      get: () => to(ref1.value),
      set: v => ref1.value = from(v),
    });
  }

  const ref2 = ref(_ref2 ?? ref1.value) as Ref<R2>;

  if (to) {
    watch(ref1, v => ref2.value = to(v));
  } else if (from) {
    watch(ref2, v => ref1.value = from(v));
  }

  return ref2;
}
