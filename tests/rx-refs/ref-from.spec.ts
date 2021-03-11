import { isRef, nextTick, reactive } from 'vue';
import { refFrom } from '../../src/rx-refs/ref-from';

describe('refFrom', () => {
  it('processes observable input', async () => {
    const resolve = Promise.resolve(42);

    const resolveRef = refFrom(resolve);

    expect(resolveRef.value).toBeUndefined();

    const resolved = await resolve;

    expect(resolveRef.value).toBe(resolved);
  });

  it('processes reactive state', async () => {
    const state = reactive({ value: 42 });

    const r = refFrom(state, 'value');

    expect(isRef(r)).toBe(true);

    r.value = 0;

    await nextTick();

    expect(state.value).toBe(r.value);
  });

  it('doesn\'t panic', async () => {
    const initial = 'what is this';
    const final = 'wow';

    const r = refFrom(initial);

    expect(isRef(r)).toBe(true);
    expect(r.value).toBe(initial);

    r.value = final;

    await nextTick();

    expect(r.value).toBe(final);
  });
});
