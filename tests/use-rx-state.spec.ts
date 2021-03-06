import { isObservable, of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { delay, tap } from 'rxjs/operators';
import { isProxy } from 'vue';
import { useRxState } from '../src/use-rx';

type State = { count: number, foo?: string };

const fn = jest.fn();

const defaultCount = 0;
const step = 1;

const use = () => useRxState<State>(() => ({ count: defaultCount }))({
  increment: () => state => ({ count: state.count + step }),
  setCount: (count: number) => ({ count }),
  setCountAfter: (count: number, timeout: number) => of({ count }).pipe(delay(timeout)),
  incrementAfter(timeout: number) {
    return (state): Observable<State> =>
      this.setCountAfter(this.increment()(state).count, timeout);
  },
  setFoo: (foo?: string) => ({ foo }),
}, state$ => state$.pipe(tap(fn)));

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

    expect(fn).toHaveBeenCalled();

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

  it('support deep nested states', () => {
    const value1 = 'foobar';
    const value2 = 'barfoo';
    const newValue1 = 'new foobar';
    const newValue2 = 'new barfoo';

    const deep = useRxState({
      deep: {
        nested: {
          value1,
          value2,
        } as {
          value1?: string,
          value2: string,
        } | string,
      },
    })({
      setValue1: (value1?: string) => ({ deep: { nested: { value1 } } }),
      setValue2: (value2: string) => ({ deep: { nested: { value2 } } }),
      setNested: (nested) => ({ deep: { nested } }),
    }).subscribe();

    deep.actions.setValue2(newValue2);

    expect((deep.state.deep.nested as any).value2).toBe(newValue2);
    expect((deep.state.deep.nested as any).value1).toBe(value1);

    deep.actions.setValue1(newValue1);

    expect((deep.state.deep.nested as any).value2).toBe(newValue2);
    expect((deep.state.deep.nested as any).value1).toBe(newValue1);

    deep.actions.setValue1(undefined);

    expect((deep.state.deep.nested as any).value2).toBe(newValue2);
    expect((deep.state.deep.nested as any).value1).toBeUndefined();

    deep.actions.setNested(newValue1);
    expect(deep.state.deep.nested).toBe(newValue1);
  });

  it('creates a readonly state', () => {
    const counter = use().subscribe();

    //@ts-ignore
    counter.state.count = 1;

    expect(counter.state.count).toBe(0);
  });
});
