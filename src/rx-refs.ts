import { ref, Ref, toRef, watch, WatchSource } from 'vue';
import { tap } from 'rxjs/operators';
import { Observable, OperatorFunction } from 'rxjs';
import { RxResult } from './use-rx';
import { untilUnmounted } from './hooks/until';

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
export function observeRef<R>(ref: WatchSource<R>): Observable<R>;
export function observeRef<R extends Record<string, any>>(ref: R): Observable<R>;
export function observeRef<R extends Record<string, any> | WatchSource<any>>(ref: R): Observable<R> {
  return untilUnmounted(
    new Observable<R>(ctx => watch(ref, value => ctx.next(value)))
  );
};

/**
 * Creates a one-side bind between a ref and a value from a reactive state.
 *
 * When the reactive state changes, the ref is updated, but not vice versa!
 * @param state a reactive state to bind from
 * @param prop a prop to bind from
 * @param map a transformer map from the state prop to the ref
 * @param refVar an existing ref to bind
 */
export function syncRef<S extends Record<string, any>, K extends keyof S, R>(
  state: S,
  prop: K,
  map: (value: S[K]) => R,
  refValue?: Ref<R>
): Ref<R> {
  const refVar = refValue ?? ref(map(state[prop])) as Ref<R>;

  observeRef<S[K]>(toRef(state, prop)).subscribe(_ => refVar.value = map(_));

  return refVar;
}
