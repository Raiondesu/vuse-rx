import type { Observable, PartialObserver, Subscription } from 'rxjs';
import type { DeepReadonly } from 'vue';

import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan, scan, tap } from 'rxjs/operators';
import { reactive, readonly } from 'vue';
import { untilUnmounted } from '../operators/until';
import { MutationStrategy, UnwrapNestedRefs } from './common';
import { shallowArray, ShallowArrayMutation } from './strategies/shallowArray';


export interface RxStateOptions<S extends Record<PropertyKey, any>, Mutaiton> {
  mutationStrategy: MutationStrategy<S, Mutaiton>;
}

const defaultOptions = {
  mutationStrategy: shallowArray,
};

/**
 * Allows to bind reducers to a state and an observable.
 *
 * First accepts state's default value and a state merge strategy,
 * then accepts a map of state reducers.
 *
 * @param initialState - a factory or initial value for the reactive state
 * @param options - options to customize the behavior, for example - to apply a custom strategy of merging a mutation with an old state
 */
export function useRxState<T extends Record<PropertyKey, any>, Mutation = ShallowArrayMutation<UnwrapNestedRefs<T>>>(
  initialState: T | (() => T),
  options?: Partial<RxStateOptions<UnwrapNestedRefs<T>, Mutation>>
): CreateRxState<UnwrapNestedRefs<T>, Mutation> {
  const { mutationStrategy: mergeKeys } = {
    ...defaultOptions as RxStateOptions<UnwrapNestedRefs<T>, Mutation>,
    ...options
  };

  return function (reducers, map$?) {
    type S = UnwrapNestedRefs<T>;
    type ReducerResult = ReturnType<StateReducer<S, Mutation>>;
    type Actions = ReducerActions<typeof reducers>;

    const state = reactive(maybeCall(initialState));

    const actions = <Actions> {};
    const actions$ = <ReducerObservables<Actions, S>> {};
    const actions$Arr = <Observable<S>[]> [];

    let complete = false;
    let error: any = undefined;

    const context: MutationContext = {
      error: e => { error = e; },
      complete: () => { complete = true; }
    };

    for (const key in reducers) {
      const mutations$ = new Subject<ReducerResult>();

      actions[key] = <ReducerAction<typeof reducers[typeof key]>>(
        (...args: any[]) => mutations$.next(
          reducers[key].apply(reducers, args)
        )
      );

      actions$Arr.push(
        actions$[`${key}$` as const] = (
          mergeScan((prev: S, curr: ReducerResult) => {
            curr = maybeCall(curr, prev, context);

            return (
              isObservable(curr)
                ? curr
                : of(curr)
            ).pipe(
              map(mergeKeys(prev, mergeKeys)),
              tap({
                next: () => error
                  ? error = mutations$.error(error)
                  : complete && mutations$.complete()
              })
            )
          }, state)(mutations$)
        )
      );
    }

    const merged$ = merge(...actions$Arr);

    return createRxResult({
      actions,
      state: readonly(state as T),
      state$: untilUnmounted(
        map$ ? map$(
          merged$,
          reducers,
          state,
          actions$,
          context,
        ).pipe(
          scan((prev, curr) => mergeKeys(prev, mergeKeys)(curr), state)
        ) : merged$
      ),
      actions$: actions$ as ReducerObservables<Actions, DeepReadonly<S>>,
    });
  };
}

type CreateRxState<S, Mutation> = {
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
   * @param reducers a map of reducers to mutate the state
   * @param map$ a function to modify the resulting observable
   */
  <R extends StateReducers<S, Mutation>>(
    reducers: R,
    map$?: (
      state$: Observable<S>,
      reducers: R,
      state: S,
      actions$: Record<Action$<Extract<keyof R, string>>, Observable<S>>,
      context: MutationContext
    ) => Observable<Mutation>
  ): SubscribableRxResult<ReducerActions<R>, S>;
};

const createRxResult = <S, Actions>(result: {
  actions: Actions,
  state: DeepReadonly<S>,
  state$: Observable<S>,
  actions$: ReducerObservables<Actions, DeepReadonly<S>>
}): SubscribableRxResult<Actions, S> => ({
  ...result,
  subscribe: (...args: any[]) => ({
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

export interface MutationContext {
  error(error: any): void;
  complete(): void;
}

export type StatefulMutation<S, Mutation> = (state: S, mutation?: MutationContext) => Mutation | Observable<Mutation>;

/**
 * A reducer for the observable state
 */
export type StateReducer<S, Mutation, Args extends any[] = any[]> = (
  (...args: Args) =>
    | Mutation
    | Observable<Mutation>
    | StatefulMutation<S, Mutation>
);

/**
 * A named collection of state reducers
 */
export type StateReducers<S, Mutation> = Record<string, StateReducer<S, Mutation>>;

/**
 * A method action generated from a StateReducer
 */
export type ResAction<A extends any[] = []> = (...args: A) => void;

type Action$<Name extends string> = `${Name}$`;

type ReducerObservables<H, R> = {
  [key in Action$<Extract<keyof H, string>>]: Observable<R>;
};

/**
 * Resulting RX bindings:
 *
 * * actions - a named collection of ResAction-s
 * * state - a reactive vue state
 * * state$ - an rxjs observable
 */
export interface RxResult<Actions, State> {
  readonly actions: Actions;
  readonly state: DeepReadonly<State>;
  readonly state$: Observable<State>;
  readonly actions$: ReducerObservables<Actions, DeepReadonly<State>>;
};

export interface SubscribableRxResult<Actions, State> extends RxResult<Actions, State> {
  readonly subscribe: {
    (observer?: PartialObserver<State>): SubscriptionRxResult<Actions, State>;
    (...args: Parameters<Observable<State>['subscribe']>): SubscriptionRxResult<Actions, State>;
  };
};

export interface SubscriptionRxResult<Actions, State> extends RxResult<Actions, State> {
  readonly subscription: Subscription;
}

type ReducerAction<R> = R extends StateReducer<any, any, infer Args>
  ? ResAction<Args>
  : never;

type ReducerActions<R> = { [key in keyof R]: ReducerAction<R[key]> };
