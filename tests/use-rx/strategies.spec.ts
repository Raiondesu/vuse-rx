import { deep, shallow, deepReplaceArray, useRxState, defaultBuiltin } from '../../src/use-rx';

const initialState = { a: { b: 'c', d: [{ e: 'f'} as Record<string, string>] }, g: 'h' };

describe('use-rx-state strategies: shallow', () => {
  it('merges states correctly', () => {
    const gMutation = ({ g: 'i' });
    const fn = jest.fn();

    const { state, actions: { changeG } } = useRxState(initialState, { mutationStrategy: shallow })({
      changeG: () => gMutation,
    }).subscribe(s => {
      fn();
      expect(s).toStrictEqual(state);
      expect(s.g).toBe(gMutation.g);
      expect(s).toEqual({ ...initialState, ...gMutation });
    });

    changeG();

    expect(fn).toHaveBeenCalled();
    expect(state.g).toBe(gMutation.g);
    expect(state).toEqual({ ...initialState, ...gMutation });
  });
});

describe('use-rx-state strategies: deep', () => {
  it('merges states correctly', () => {
    const initial = initialState.a.d.slice();
    const aMutation = { a: { d: [{ j: 'k' }] } };

    const { state: s, actions: { changeA } } = useRxState(initialState, { mutationStrategy: deep })({
      changeA: () => aMutation,
    }).subscribe();

    changeA();

    expect(s.a.d.length).toBe(1);
    expect(s.a.d[0]).toEqual({ ...initial[0], ...aMutation.a.d[0] });
  });
});

describe('use-rx-state strategies: deepReplaceArray', () => {
  it('merges states correctly', () => {
    const initial = initialState.a.d.slice();
    const aMutation = { a: { d: [{ j: 'k' }] } };

    const { state: s, actions: { changeA, mergeA } } = useRxState(
      initialState,
      { mutationStrategy: deepReplaceArray }
    )({
      changeA: () => aMutation,
      mergeA: () => state => ({ a: { d: [...state.a.d, ...aMutation.a.d] } }),
    }).subscribe();

    mergeA();

    expect(s.a.d).toEqual(initial.concat(aMutation.a.d));

    changeA();

    expect(s.a.d).toEqual(aMutation.a.d);
  });
});

describe('use-rx-state strategies: deepReplaceBuiltin', () => {
  it('merges states correctly', () => {
    const v = Symbol();
    class Test { [v] = 1 }
    const t1 = new Test();
    const t2 = new Test();
    t2[v] = 2;

    const r1 = /c/;
    const r2 = /c2/;

    const d1 = new Date();
    const d2 = new Date('09.08.1997');

    const initialState = { a: { b: r1, d: [{ e: 'f'} as Record<string, string>] }, g: t1, h: d1 };
    const initial = initialState.a.d.slice();
    const aMutation = { a: { d: [{ j: 'k' }] }, g: t2, h: d2 };

    const { state: s, actions: { changeA, mergeA } } = useRxState(
      initialState,
      { strategyContext: [...defaultBuiltin, Test] }
    )({
      changeA: () => aMutation,
      mergeA: () => state => ({ a: { d: [...state.a.d, ...aMutation.a.d], b: r2 } }),
    }).subscribe();

    expect(s.g).toStrictEqual(t1);
    expect(s.a.b).toBe(r1);
    expect(s.h).toBe(d1);

    mergeA();

    expect(s.a.d).toEqual(initial.concat(aMutation.a.d));
    expect(s.g).toStrictEqual(t1);
    expect(s.a.b).toBe(r2);
    expect(s.h).toBe(d1);

    changeA();

    expect(s.h).toBe(d2);
    expect(s.a.b).toBe(r2);
    expect(s.g).toStrictEqual(t2);
    expect(s.a.d).toEqual(aMutation.a.d);
  });
});
