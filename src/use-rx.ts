import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan, scan, tap } from 'rxjs/operators';
import { reactive, readonly } from 'vue';
import { untilUnmounted } from './hooks/until';

import type { Observable, PartialObserver, Subscription } from 'rxjs';
import type { DeepReadonly, Ref, UnwrapRef } from 'vue';

export interface MutationStrategy<S extends Record<PropertyKey, any>> {
  /**
   * Creates a mutation applier
   *
   * @param state - a base state to mutate
   * @param strategy - current mutation strategy
   */
  (state: S, strategy: MutationStrategy<S>): (
    mutation: S | DeepPartial<S>
  ) => S;
}

export const canMergeDeep = <S extends Record<PropertyKey, any>>(
  state: S,
  mutation: S | DeepPartial<S>,
  key: keyof S,
) =>  (
  typeof mutation[key] === 'object'
  && mutation !== null
  && typeof state[key] === 'object'
);

export const deepMergeKeys = <S extends Record<PropertyKey, any>>(
  state: S
) => (
  mutation: DeepPartial<S>
) => {
  for (const key in mutation) {
    state[key] = canMergeDeep(state, mutation, key)
      ? deepMergeKeys(state[key])(mutation[key])
      : mutation[key] as any;
  }

  return state;
};

export interface RxStateOptions<S> {
  mutationStrategy: MutationStrategy<S>;
}

const defaultOptions: RxStateOptions<any> = {
  mutationStrategy: deepMergeKeys,
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
export function useRxState<T extends Record<string, any>>(
  initialState: T | (() => T),
  options: Partial<RxStateOptions<UnwrapNestedRefs<T>>> = defaultOptions
): CreateRxState<UnwrapNestedRefs<T>> {
  const {
    mutationStrategy: mergeKeys,
  } = { ...defaultOptions, ...options };

  return function (reducers, map$?) {
    type S = UnwrapNestedRefs<T>;
    type ReducerResult = ReturnType<StateReducer<S>>;
    type Actions = ReducerActions<typeof reducers>;

    const state = reactive(maybeCall(initialState));

    const actions = <Actions> {};
    const actions$ = <ReducerObservables<Actions, S>> {};
    const actions$Arr = <Observable<S>[]> [];

    for (const key in reducers) {
      const mutations$ = new Subject<ReducerResult>();

      actions[key] = <ReducerAction<typeof reducers[typeof key]>>(
        (...args) => mutations$.next(
          reducers[key].apply(reducers, args)
        )
      );

      actions$Arr.push(
        actions$[`${key}$` as const] = (
          mergeScan((prev: S, curr: ReducerResult) => {
            let complete = false;
            let error: any = undefined;

            curr = maybeCall(curr, prev, {
              error: e => { error = e },
              complete: () => { complete = true }
            });

            return (
              isObservable(curr) ? curr : of(curr)
            ).pipe(
              map(mergeKeys(prev, mergeKeys)),
              tap(() => (
                complete
                  ? mutations$.complete()
                  : error && mutations$.error(error)
              ))
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
        ).pipe(
          scan((prev, curr) => (mergeKeys(prev, mergeKeys)(curr)), state)
        ) : merged$
      ),
      actions$: actions$ as ReducerObservables<Actions, DeepReadonly<S>>,
    });
  };
}

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

const createRxResult = <S, Actions>(result: {
  actions: Actions,
  state: DeepReadonly<S>,
  state$: Observable<S>,
  actions$: ReducerObservables<Actions, DeepReadonly<S>>
}): SubscribableRxRes<Actions, S> => ({
  ...result,
  subscribe: (...args) => ({
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

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends Record<any, any>
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;

export type MutationContext = {
  error(error: any): void;
  complete(): void;
}

export type Mutation<S> =
  // | void
  // isn't useful,
  // need to keep mutations explicit in what they do
  | S
  | DeepPartial<S>
  | Observable<DeepPartial<S>>;

/**
 * A reducer for the observable state
 */
export type StateReducer<S, Args extends any[] = any[]> = (...args: Args) =>
  | Mutation<S>
  | ((state: S, mutation: MutationContext) => Mutation<S>)
  ;

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
export type RxResult<
  Actions,
  State,
  RState = DeepReadonly<State>
> = {
  readonly actions: Actions;
  readonly state: RState;
  readonly state$: Observable<State>;
};

type Action$<Name extends string> = `${Name}$`;

type ReducerObservables<H, R> = {
  [key in Action$<Extract<keyof H, string>>]: Observable<R>;
};

export type SubscribableRxRes<
  Actions,
  State,
  RState = DeepReadonly<State>
> = RxResult<Actions, State, RState> & {
  readonly actions$: ReducerObservables<Actions, RState>;
  readonly subscribe: PipeSubscribe<SubscribableRxRes<Actions, State, RState>, State>;
};

export type PipeSubscribe<Res extends SubscribableRxRes<any, any>, S> = {
  (observer?: PartialObserver<S>): Omit<Res, 'subscribe'> & {
    readonly subscription: Subscription;
  };
  (...args: Parameters<Observable<S>['subscribe']>): Omit<Res, 'subscribe'> & {
    readonly subscription: Subscription;
  };
};

type ReducerAction<R> = R extends StateReducer<any, infer Args>
  ? ResAction<Args>
  : never;

type ReducerActions<R> = { [key in keyof R]: ReducerAction<R[key]> };
