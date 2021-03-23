import { nextTick, ref } from 'vue';
import { fromRef } from '../../src/rx-refs/from-ref';

describe('fromRef', () => {
  it('creates observable from ref', async () => {
    const fn = jest.fn(value => expect(typeof value).toBe('number'));

    const someRef = ref(0);

    const ref$ = fromRef(someRef);

    ref$.subscribe(fn);

    await nextTick();

    expect(fn).toBeCalledTimes(0);

    someRef.value = 1;

    await nextTick();

    expect(fn).toBeCalledTimes(1);
  });
})
