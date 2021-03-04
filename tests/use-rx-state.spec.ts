import { identity, isObservable, of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { delay } from 'rxjs/operators';
import { isProxy } from 'vue';
import { useRxState } from '../src/use-rx';

type State = { count: number, foo?: string };

const $increment: (s: State) => State = jest.fn(identity);
const $setCount: (s: State) => State = jest.fn(identity);
const $setCountAfter: (s: Observable<State>) => Observable<State> = jest.fn(identity);
const $incrementAfter: (s: Observable<State>) => Observable<State> = jest.fn(identity);

const defaultCount = 0;
const step = 1;

const use = () => useRxState<State>(() => ({ count: defaultCount }))({
  increment: () => state => $increment({ count: state.count + step }),
  setCount: (count: number) => $setCount({ count }),
  setCountAfter: (count: number, timeout: number) => $setCountAfter(of({ count }).pipe(delay(timeout))),
  incrementAfter(timeout: number) {
    return (state): Observable<State> => $incrementAfter(this.setCountAfter(this.increment()(state).count, timeout));
  },
  setFoo: (foo?: string) => ({ foo }),
});

const time = (timeout: number) => new Promise(res => setTimeout(() => res(undefined), timeout));

describe('useRxState', () => {
  it('binds the state to reducers', async () => {
    const timeout = 100;
    const $subscription = jest.fn();

    const { actions, actions$, state, state$ } = use().subscribe($subscription);

    expect(isObservable(state$)).toBe(true);
    Object.values(actions$).forEach($ => expect(isObservable($)).toBe(true));

    expect(isProxy(state)).toBe(true);
    Object.values(actions).forEach(_ => expect(typeof _ === 'function').toBe(true));

    expect(state.count).toBe(defaultCount);
    expect(state.foo).toBeUndefined();

    expect(actions.incrementAfter(timeout)).toBeUndefined();

    expect(state.count).toBe(defaultCount);

    await time(timeout);

    expect(state.count).toBe(defaultCount + step);
    expect($subscription).toBeCalledTimes(1);

    expect(actions.setCountAfter(defaultCount, timeout)).toBeUndefined();

    expect(state.count).toBe(defaultCount + step);
    expect($subscription).toBeCalledTimes(1);

    await time(timeout);

    expect(state.count).toBe(defaultCount);
    expect($subscription).toBeCalledTimes(2);

    expect(actions.increment()).toBeUndefined();
    expect(state.count).toBe(defaultCount + step);
    expect($subscription).toBeCalledTimes(3);

    expect(actions.setCount(defaultCount)).toBeUndefined();
    expect(state.count).toBe(defaultCount);
    expect($subscription).toBeCalledTimes(4);

    expect(actions.setFoo(String(defaultCount))).toBeUndefined();

    expect(state.foo).toBe(String(defaultCount));

    expect(actions.setFoo(undefined)).toBeUndefined();
    expect(state.foo).toBeUndefined();
  });
});
