import { isObservable, merge, Observable, of, Subject } from 'rxjs';
import { OperatorFunction } from 'rxjs/internal/types';
import { map, mergeScan, switchMap, takeUntil } from 'rxjs/operators';
import { reactive, Ref, ref } from 'vue';
import { createOnDestroySubject } from './util';

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
    pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>, ...operations: OperatorFunction<any, any>[]): Observable<any>;
    pipe(...operations: OperatorFunction<any, any>[]): Observable<any>;
  }
}

export type StateHandler<S, Args extends any[] = any[]> =
  | ((...args: Args) => Partial<S>)
  | ((...args: Args) => Observable<Partial<S>>)
  | ((...args: Args) => (state: S) => Partial<S>)
  | ((...args: Args) => (state: S) => Observable<Partial<S>>);

export type StateHandlers<S> = Record<string, StateHandler<S>>;
export type ResHandler<A extends any[] = []> = (...args: A) => void;

export type RxResult<H, S, R = Readonly<S>> = readonly [
  handler: H,
  state: R,
  state$: Observable<S>,
];

type ReducerHandler<R> = R extends StateHandler<any, infer Args>
  ? ResHandler<Args>
  : never;

function _useRX<S>(stateUpdate: StateHandler<S>) {
  const args$ = new Subject<any[]>();

  return [
    (...args: any[]) => args$.next(args),
    args$.pipe(
      map(args => stateUpdate(...args)),
      switchMap(update =>
        isObservable<Partial<S>>(update)
          ? update
          : of(update)
      ),
    ),
  ] as const;
}

type PipeReducers<S> = {
  <R extends StateHandlers<S>>(reducers: R): RxResult<{ [key in keyof R]: ReducerHandler<R[key]> }, S>;
};

export function useRx<S>(subject?: Subject<S>): RxResult<ResHandler<[state: S]>, S, Ref<S | null>> {
  const _subject = subject ?? new Subject<S>();
  const rState = ref<S | null>(null) as Ref<S | null>;

  return [(state: S) => _subject.next(rState.value = state), rState, _subject.asObservable()] as const;
}

const updateKeys = <S>(prev: S) => (curr: Partial<S>) => {
  for (const key in curr) {
    prev[key] = curr[key] ?? prev[key];
  }

  return prev;
};

export function useRxState<S extends Record<string, any>>(initialState: S): PipeReducers<S> {
  const state = reactive(initialState) as S;

  return <PipeReducers<S>>function (reducers: StateHandlers<S>) {
    const mergeStates = [
      mergeScan((state: S, curr: ReturnType<StateHandler<S>>): Observable<S> => {
        const update = updateKeys(state);
        const newState = typeof curr === 'function'
          ? curr(state)
          : curr;

        return isObservable<Partial<S>>(newState)
          ? newState.pipe(map(update))
          : of(update(newState));
      }, state),
      takeUntil(createOnDestroySubject()),
    ] as const;

    const handlers: Record<string, (payload: any) => any> = {};
    const observables: Observable<ReturnType<StateHandler<S>>>[] = [];

    for (const key in reducers) {
      const [handler, state$] = _useRX(reducers[key]);

      handlers[key] = handler;
      observables.push(state$);
    }

    const events$ = merge(...observables).pipe(...mergeStates);

    return [handlers, state, events$] as const;
  };
}
