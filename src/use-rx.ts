import { isObservable, merge, of, Subject, identity, Observable } from 'rxjs';
import { map, mergeScan, scan } from 'rxjs/operators';
import { DeepReadonly, onUnmounted, reactive, readonly, Ref, UnwrapRef } from 'vue';
import { pipeUntil } from './hooks/until';

type MergeStrategy<S extends Record<string, any>> = (previousState: S) => (currentState: DeepPartial<S>) => S;

const deepUpdate = <S extends Record<string, any>>(prev: S) => (curr: DeepPartial<S>) => {
  for (const key in curr) {
    if (
      typeof prev[key] === 'object'
      && typeof curr[key] === 'object'
      && curr != null
    ) {
      prev[key] = deepUpdate(prev[key])(curr[key]);
    } else {
      prev[key] = curr[key] as any;
    }
  }

  return prev;
};

/**
 * Allows to bind reducers to a state and an observable.
 *
 * First accepts a state factory and a state merge strategy,
 * then accepts a map of state reducers.
 *
 * @param createState a factory for the reactive state
 * @param mergeStrategy a strategy of merging a mutation with an old state
 */
export function useRxState<S extends Record<string, any>>(createState: () => S, mergeStrategy?: MergeStrategy<S>): CreateRxState<S>;

/**
 * Allows to bind reducers to a state and an observable.
 *
 * First accepts state's default value and a state merge strategy,
 * then accepts a map of state reducers.
 *
 * @param initialState an initial value for the reactive state
 * @param mergeStrategy a strategy of merging a mutation with an old state
 */
export function useRxState<S extends Record<string, any>>(initialState: S, mergeStrategy?: MergeStrategy<S>): CreateRxState<S>;

/**
 * Allows to bind reducers to a state and an observable.
 *
 * First accepts state's default value and a state merge strategy,
 * then accepts a map of state reducers.
 *
 * @param initialState a factory or initial value for the reactive state
 * @param mergeStrategy a strategy of merging a mutation with an old state
 */
export function useRxState<S extends Record<string, any>>(initialState: S | (() => S), mergeStrategy?: MergeStrategy<S>): CreateRxState<S>;
export function useRxState<T extends Record<string, any>>(initialState: T | (() => T), mergeKeys = deepUpdate) {
  type S = UnwrapNestedRefs<T>;
  type PS = DeepPartial<S>;

  return function <R extends StateReducers<S>>(
    reducers: R,
    map$: (
      state$: Observable<S>,
      reducers: R,
      state: S,
      actions$: Record<Action$<Extract<keyof R, string>>, Observable<S>>
    ) => Observable<PS> = identity as any
  ): SubscribableRxRes<ReducerActions<R>, S> {
    type ReducerResult = ReturnType<StateReducer<S>>;
    type Actions = ReducerActions<R>;

    const state = reactive(maybeCall(initialState));

    const mergeStates = mergeScan((prev: S, curr: ReducerResult) => {
      const newState = maybeCall(curr, prev);

      return (
        isObservable<DeepPartial<S>>(newState)
          ? newState
          : of(newState)
      ).pipe(map(mergeKeys(prev)));
    }, state);

    const actions = <Actions> {};
    const actions$ = <ReducerObservables<Actions, S>> {};

    for (const key in reducers) {
      const mutations$ = new Subject<ReducerResult>();

      actions[key] = ((...args: any[]) => mutations$.next(reducers[key](...args))) as ReducerAction<R[keyof R]>;
      actions$[getAction$Name(key)] = mutations$.pipe(mergeStates);
    }

    const state$ = map$(
      merge(...Object.values(actions$ as Record<string, Observable<S>>)),
      reducers,
      state,
      actions$,
    ).pipe(
      scan((acc, curr) => deepUpdate(acc)(curr), state),
      pipeUntil(onUnmounted),
    );

    return createRxResult({
      actions,
      state: readonly(state as T),
      state$,
      actions$: actions$ as ReducerObservables<Actions, DeepReadonly<S>>,
    });
  };
}

const getAction$Name = <K extends string>(name: K): Action$<K> => `on${name[0].toUpperCase()}${name.slice(1)}` as Action$<K>;

const createRxResult = <S, Actions>(result: {
  actions: Actions,
  state: DeepReadonly<S>,
  state$: Observable<S>,
  actions$: ReducerObservables<Actions, DeepReadonly<S>>
}): SubscribableRxRes<Actions, S> => ({
  ...result,
  subscribe: (...args: Parameters<Observable<S>['subscribe']>) => ({
    ...result,
    subscription: result.state$.subscribe(...args),
  }),
})

const maybeCall = <T, A extends any[]>(
  fn: T | ((...args: A) => T),
  ...args: A
) => (
  typeof fn === 'function'
    ? (fn as (...args: A) => T)(...args)
    : fn
);

type Builtin =
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

type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends Record<any, any>
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;

/**
 * A reducer for the observable state
 */
export type StateReducer<S, Args extends any[] = any[]> =
  | ((...args: Args) => DeepPartial<S> | Observable<DeepPartial<S>>)
  | ((...args: Args) => (state: S) => DeepPartial<S> | Observable<DeepPartial<S>>);

/**
 * A named collection of state reducers
 */
export type StateReducers<S> = Record<string, StateReducer<S>>;

/**
 * A method action generated from a StateReducer
 */
export type ResAction<A extends any[] = []> = (...args: A) => void;

/**
 * Resulting RX bindings:
 *
 * * actions - a named collection of ResAction-s
 * * state - a reactive vue state
 * * state$ - an rxjs observable
 */
export type RxResult<H, S, R = DeepReadonly<S>> = {
  readonly actions: H;
  readonly state: R;
  readonly state$: Observable<S>;
};

type Action$<Name extends string> = `on${Capitalize<Name>}`;

type ReducerObservables<H, R> = {
  [key in Action$<Extract<keyof H, string>>]: Observable<R>;
};

export type SubscribableRxRes<H, S, R = DeepReadonly<S>> = RxResult<H, S, R> & {
  readonly actions$: ReducerObservables<H, R>;
  readonly subscribe: PipeSubscribe<SubscribableRxRes<H, S, R>, S>;
};

export type PipeSubscribe<Res extends SubscribableRxRes<any, any>, S> = {
  (...args: Parameters<Observable<S>['subscribe']>): Omit<Res, 'subscribe'> & {
    readonly subscription: ReturnType<Observable<S>['subscribe']>;
  };
};

type ReducerAction<R> = R extends StateReducer<any, infer Args>
  ? ResAction<Args>
  : never;

type ReducerActions<R> = { [key in keyof R]: ReducerAction<R[key]> };

type CreateRxState<S> = {
  /**
   * Allows to bind reducers to a state and an observable.
   *
   * Accepts a map of state reducers.
   *
   * Each reducer can either return:
   * * an updated part of the state:
   *   ```
   *   (v) => ({ value: v })
   *   ```
   * * an observable that emits an updated part of the state:
   *   ```
   *   (v) => new BehaviorSubject({ value: v })
   *   ```
   * * a function that accepts the old state and returns either of the previous types:
   *   ```
   *   (v) => (oldState) => ({
   *       value: oldState.value > v ? oldState.value : v
   *   })
   *   ```
   *
   * @param initialState an initial value for the reactive state
   * @param mergeStrategy a strategy of merging a mutation with an old state
   */
  <R extends StateReducers<S>>(
    reducers: R,
    map$?: (
      state$: Observable<S>,
      reducers: R,
      state: S,
      actions$: Record<Action$<Extract<keyof R, string>>, Observable<S>>
    ) => Observable<DeepPartial<S>>
  ): SubscribableRxRes<ReducerActions<R>, S>;
};
