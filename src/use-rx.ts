import { isObservable, merge, of, Subject, identity, Observable } from 'rxjs';
import { map, mergeScan, scan } from 'rxjs/operators';
import { onUnmounted, reactive, Ref, UnwrapRef } from 'vue';
import { pipeUntil } from './hooks/until';

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;

/**
 * A reducer for the observable state
 */
export type StateReducer<S, Args extends any[] = any[]> =
  | ((...args: Args) => Partial<S> | Observable<Partial<S>>)
  | ((...args: Args) => (state: S) => Partial<S> | Observable<Partial<S>>);

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
export type RxResult<H, S, R = Readonly<S>> = {
  readonly actions: H;
  readonly state: R;
  readonly state$: Observable<S>;
};

type Action$<Name extends string> = `on${Capitalize<Name>}`;

type ReducerObservables<H, R> = {
  [key in Action$<Extract<keyof H, string>>]: Observable<R>;
};

export type SubscribableRxRes<H, S, R = Readonly<S>> = RxResult<H, S, R> & {
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
  <R extends StateReducers<S>>(
    reducers: R,
    map$?: (
      state$: Observable<Readonly<S>>,
      reducers: R,
      state: Readonly<S>,
      actions$: Record<Action$<Extract<keyof R, string>>, Observable<S>>
    ) => Observable<Partial<S>>
  ): SubscribableRxRes<ReducerActions<R>, S>;
}

const updateKeys = <S>(prev: S) => (curr: Partial<S>) => {
  for (const key in curr) {
    prev[key] = curr[key] as S[Extract<keyof S, string>];
  }

  return prev;
};

const getAction$Name = <K extends string>(name: K): Action$<K> => `on${name[0].toUpperCase()}${name.slice(1)}` as Action$<K>;

const createRxResult = <S, Actions>(result: {
  actions: Actions,
  state: S,
  state$: Observable<S>,
  actions$: ReducerObservables<Actions, S>
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

/**
 * Allows to bind reducers to a state and an observable.
 *
 * First accepts state's default value,
 * then accepts a map of state reducers.
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
 */
export function useRxState<S extends Record<string, any>>(initialState: () => S): CreateRxState<S>;
export function useRxState<S extends Record<string, any>>(initialState: S): CreateRxState<S>;
export function useRxState<S extends Record<string, any>>(initialState: S | (() => S)): CreateRxState<S>;
export function useRxState<T extends Record<string, any>>(initialState: T | (() => T)) {
  type S = UnwrapNestedRefs<T>;

  return function <R extends StateReducers<S>>(
    reducers: R,
    map$: (
      state$: Observable<Readonly<S>>,
      reducers: R,
      state: Readonly<S>,
      actions$: Record<Action$<Extract<keyof R, string>>, Observable<S>>
    ) => Observable<Partial<S>> = identity
  ): SubscribableRxRes<ReducerActions<R>, S> {
    type ReducerResult = ReturnType<StateReducer<S>>;
    type Actions = ReducerActions<R>;

    const state = reactive(maybeCall(initialState));

    const mergeStates = mergeScan((prev: S, curr: ReducerResult) => {
      const newState = maybeCall(curr, prev);

      return (
        isObservable<Partial<S>>(newState)
          ? newState
          : of(newState)
      ).pipe(map(updateKeys(prev)));
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
      scan((acc, curr) => updateKeys(acc)(curr), state),
      pipeUntil(onUnmounted),
    );

    return createRxResult({
      actions,
      state,
      state$,
      actions$,
    });
  };
}
