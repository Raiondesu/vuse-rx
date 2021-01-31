import { ref, Ref } from 'vue';
import { tap } from 'rxjs/operators';
import { Observable, OperatorFunction } from 'rxjs';
import { RxResult } from './use-rx';

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
  ): [refs: RefsObj<T>, observable$: Observable<O>];

  <O, T extends RefsMap<O>>(
    observable: Observable<O>,
    map: T,
    initialState: O
  ): [refs: RefsObj<T>, observable$: Observable<O>];

  <O, T extends RefsMap<O, true>>(
    observable: Observable<O>,
    map: T,
    initialState?: O
  ): [refs: RefsObj<T>, observable$: Observable<O>];
} = <O, T extends RefsMap<O, true>>(
  observable: Observable<O>,
  map: T,
  initialState?: O
): [refs: RefsObj<T>, observable$: Observable<O>] => {
  const ops: OperatorFunction<O, O>[] = [];
  const refs = {} as RefsObj<T>;

  for (const key in map) {
    refs[key] = ref(map[key](initialState));

    ops.push(tap(state => refs[key].value = map[key](state)));
  }

  return [
    refs,
    observable.pipe(...ops),
  ];
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
): [refs: RefsObj<T>, ...rx: RxResult<R, O>] => {
  const [ handlers, state, state$ ] = rxState;
  const [ refs, newState$ ] = tapRefs(state$, map, state);

  return [
    refs,
    handlers,
    state,
    newState$,
  ];
};
