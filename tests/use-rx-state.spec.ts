import { isObservable, noop, of } from 'rxjs';
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
    // suppress vue warning
    const warn = console.warn;
    console.warn = noop;

    const counter = use().subscribe();

    //@ts-ignore
    counter.state.count = 1;

    expect(counter.state.count).toBe(0);
    console.warn = warn;
  });

  it('doesn\'t break on empty reducers', () => {
    const empty = useRxState({
      test: 0
    })({
      '': () => ({})
    });

    empty.actions['']();

    empty.actions$.$.subscribe();
  });

  it('applies context', () => {
    const error = 'I throw errors in reducers';
    const fn = jest.fn(e => expect(e).toBe(error));

    const wrong = useRxState({ value: 0 })({
      setValue: (value: number) => (_, ctx) => {
        if (value < 0) {
          ctx?.error(error);

          // signify that no mutation happens
          return {};
        }

        return { value };
      }
    }).subscribe({ error: fn });

    wrong.actions.setValue(-1);

    expect(fn).toHaveBeenCalledTimes(1);

    const complete = jest.fn();

    const right = useRxState({ value: 0 })({
      setValue: (value: number) => (_, ctx) => {
        if (value === 42) {
          ctx?.complete();
        }

        return { value };
      }
    }).subscribe({ complete });

    right.actions.setValue(42);

    expect(right.state.value).toBe(42);

    expect(complete).toHaveBeenCalledTimes(1);
  });
});
