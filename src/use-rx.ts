import { isObservable, merge, Observable, of, Subject, identity, interval } from 'rxjs';
import { OperatorFunction } from 'rxjs/internal/types';
import { map, mapTo, mergeScan, scan, switchMap, tap } from 'rxjs/operators';
import { onUnmounted, reactive, Ref, UnwrapRef } from 'vue';
import { pipeUntil } from './hooks/until';

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;

// @ts-ignore - some environments incorrectly assume this module doesn't exist
declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    pipe(): Observable<T>;
    pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
    pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
    pipe<A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Observable<D>;
    pipe<A, B, C, D, E>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): Observable<E>;
    pipe<A, B, C, D, E, F>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): Observable<F>;
    pipe<A, B, C, D, E, F, G>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): Observable<G>;
    pipe<A, B, C, D, E, F, G, H>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): Observable<H>;
    pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>): Observable<I>;
    pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>, ...operations: OperatorFunction<I, I>[]): Observable<I>;
    pipe<I>(...operations: OperatorFunction<I, I>[]): Observable<I>;
    pipe(...operations: OperatorFunction<any, any>[]): Observable<any>;
  }
}

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
 * A method handler generated from a StateReducer
 */
export type ResHandler<A extends any[] = []> = (...args: A) => void;

/**
 * Resulting RX bindings:
 *
 * * handlers - a named collection of ResHandler-s
 * * state - a reactive vue state
 * * state$ - an rxjs observable
 */
export type RxResult<H, S, R = Readonly<S>> = {
  readonly handlers: H;
  readonly state: R;
  readonly state$: Observable<S>;
};

type Handler$<Name extends string> = `on${Capitalize<Name>}`;

type ReducerObservables<H, R> = {
  readonly [key in Handler$<Extract<keyof H, string>>]: Observable<R>;
};

export type SubscribableRxRes<H, S, R = Readonly<S>> = RxResult<H, S, R> & {
  readonly handlers$: ReducerObservables<H, R>;
  readonly subscribe: PipeSubscribe<SubscribableRxRes<H, S, R>, S>;
};

export type PipeSubscribe<Res extends SubscribableRxRes<any, any>, S> = {
  (...args: Parameters<Observable<S>['subscribe']>): Omit<Res, 'subscribe'> & {
    readonly subscription: ReturnType<Observable<S>['subscribe']>;
  };
};

type ReducerHandler<R> = R extends StateReducer<any, infer Args>
  ? ResHandler<Args>
  : never;

type ReducerHandlers<R> = { [key in keyof R]: ReducerHandler<R[key]> };

const updateKeys = <S>(prev: S) => (curr: Partial<S>) => {
  for (const key in curr) {
    prev[key] = curr[key] ?? prev[key];
  }

  return prev;
};

const getHandler$Name = <K extends string>(name: K): Handler$<K> => `on${name[0].toUpperCase()}${name.slice(1)}` as Handler$<K>;

/**
 * Allows to bind reducers to a state and an observable.
 *
 * It isn't tied to Vue in any way, so can be used regardless
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
export function useRxState<T extends Record<string, any>>(initialState: T) {
  type S = UnwrapNestedRefs<T>;

  const reactiveState: S = reactive(initialState);

  const mergeStates = mergeScan((state: S, curr: ReturnType<StateReducer<S>>) => {
    const update = updateKeys(state);

    const newState = typeof curr === 'function'
      ? curr(state)
      : curr;

    return (
      isObservable<Partial<S>>(newState)
        ? newState.pipe(map(update))
        : of(update(newState))
    );
  }, reactiveState);

  return function <R extends StateReducers<S>>(
    reducers: R,
    map$: (
      state$: Observable<Readonly<S>>,
      reducers: R,
      state: Readonly<S>,
      handlers$: Record<Handler$<Extract<keyof R, string>>, Observable<S>>
    ) => Observable<Partial<S>> = identity
  ): SubscribableRxRes<ReducerHandlers<R>, S> {
    const handlers = <ReducerHandlers<R>> {};
    const handlers$: Record<string, Observable<S>> = {};

    for (const key in reducers) {
      const args$ = new Subject<ReturnType<StateReducer<S>>>();

      handlers[key] = ((...args: any[]) => args$.next(reducers[key](...args))) as ReducerHandler<R[keyof R]>;
      handlers$[getHandler$Name(key)] = args$.pipe(mergeStates);
    }

    const state$ = map$(
      merge(...Object.values(handlers$)),
      reducers,
      reactiveState,
      handlers$,
    ).pipe(
      scan((acc, curr) => updateKeys(acc)(curr), reactiveState),
      pipeUntil(onUnmounted),
    );

    const result = {
      handlers,
      state: reactiveState,
      state$,
      handlers$,
    };

    return {
      ...result,
      subscribe: (...args: Parameters<Observable<S>['subscribe']>) => ({
        ...result,
        subscription: state$.subscribe(...args),
      }),
    } as any as SubscribableRxRes<ReducerHandlers<R>, S>;
  };
}
