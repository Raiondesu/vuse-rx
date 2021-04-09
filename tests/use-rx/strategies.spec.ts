import { deep, shallow, shallowArray, useRxState } from '../../src/use-rx';

const initialState = { a: { b: 'c', d: [{ e: 'f'} as Record<string, string>] }, g: 'h' };

describe('use-rx-state strategies: shallow', () => {
  it('merges states correctly', () => {
    const gMutation = ({ g: 'i' });
    const fn = jest.fn();

    const { state, actions: { changeG } } = useRxState(initialState, { mutationStrategy: shallow })({
      changeG: () => gMutation,
    }).subscribe(s => {
      fn();
      expect(s).toBe(state);
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

describe('use-rx-state strategies: shallowArray', () => {
  it('merges states correctly', () => {
    const initial = initialState.a.d.slice();
    const aMutation = { a: { d: [{ j: 'k' }] } };

    const { state: s, actions: { changeA, mergeA } } = useRxState(initialState, { mutationStrategy: shallowArray })({
      changeA: () => aMutation,
      mergeA: () => state => ({ a: { d: [...state.a.d, ...aMutation.a.d] } }),
    }).subscribe();

    mergeA();

    expect(s.a.d).toEqual(initial.concat(aMutation.a.d));

    changeA();

    expect(s.a.d).toEqual(aMutation.a.d);
  });
});
