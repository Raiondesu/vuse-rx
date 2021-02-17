import { BehaviorSubject, isObservable, merge, Observable, of, Subject, identity } from 'rxjs';
import { OperatorFunction } from 'rxjs/internal/types';
import { map, mergeScan, scan, takeUntil } from 'rxjs/operators';
import { Ref, ref } from 'vue';
import { createOnDestroy$ } from './util';

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

export type PipeSubscribe<Res extends RxResult<any, any>, S> = {
  (...args: Parameters<Observable<S>['subscribe']>): readonly [
    ...Res,
    ReturnType<Observable<S>['subscribe']>,
  ];
};

/**
 * Resulting RX bindings:
 *
 * * 0 - a named collection of ResHandler-s
 * * 1 - a reactive vue state
 * * 2 - an rxjs observable
 */
export type RxResult<H, S, R = Readonly<S>> = readonly [
  handlers: H,
  state: R,
  state$: Observable<S>,
];

export type SubscribableRxRes<H, S, R = Readonly<S>> = RxResult<H, S, R> & {
  subscribe: PipeSubscribe<RxResult<H, S, R>, S>;
};

/**
 * Creates a vue ref and a ref setter from the subject.
 *
 * When the setter is called, the subject emits.
 *
 * @param subject - a base subject to draw events from
 * @returns [ref setter, ref, observable]
 */
export function useSubject<S>(subject: BehaviorSubject<S>): RxResult<ResHandler<[state: S]>, S, Readonly<Ref<S>>>;
export function useSubject<S>(subject?: Subject<S>): RxResult<ResHandler<[state: S]>, S, Readonly<Ref<S | undefined>>>;
export function useSubject<S>(subject?: Subject<S> | BehaviorSubject<S>): RxResult<ResHandler<[state: S]>, S, Readonly<Ref<S | undefined>>> {
  const _subject = subject ?? new Subject<S>();
  const rState = ref((_subject as BehaviorSubject<S>).value) as Ref<S>;

  return [(state: S) => _subject.next(rState.value = state), rState, _subject.asObservable()];
}

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
export function useRxState<S extends Record<string, any>>(initialState: S) {
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
  }, initialState);

  return function <R extends StateReducers<S>>(
    reducers: R,
    map$: (
      state$: Observable<Readonly<S>>,
      reducers: R,
      state: Readonly<S>
    ) => Observable<Partial<S>> = identity
  ): SubscribableRxRes<ReducerHandlers<R>, S> {
    const handlers = <ReducerHandlers<R>> {};
    const observables: Observable<ReturnType<StateReducer<S>>>[] = [];

    for (const key in reducers) {
      const args$ = new Subject<ReturnType<StateReducer<S>>>();

      handlers[key] = ((...args: any[]) => args$.next(reducers[key](...args))) as ReducerHandler<R[keyof R]>;
      observables.push(args$);
    }

    const state$ = map$(
      merge(...observables).pipe(mergeStates),
      reducers,
      initialState
    ).pipe(
      scan((acc, curr) => updateKeys(acc)(curr), initialState),
      takeUntil(createOnDestroy$())
    );

    const result = [
      handlers,
      initialState,
      state$,
    ] as any as SubscribableRxRes<ReducerHandlers<R>, S>;

    result.subscribe = (...args: Parameters<Observable<S>['subscribe']>) => [
      ...result,
      state$.subscribe(...args),
    ] as any;

    return result;
  };
}
