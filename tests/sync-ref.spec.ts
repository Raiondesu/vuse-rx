import { identity } from 'rxjs';
import { isRef, nextTick, ref } from 'vue';
import { syncRef } from '../src/rx-refs/sync-ref';

const ref1 = ref(0);

const ref1_to = syncRef(ref1, { to: identity });
const ref1_from = syncRef(ref1, { from: Number }, 0);
const ref2_tofrom = syncRef(ref1, { to: Number, from: Number });

describe('syncRef', () => {
  it('returns a ref', () => {
    expect(isRef(ref1_to)).toBe(true);
    expect(isRef(ref2_tofrom)).toBe(true);
  });

  it('binds a ref both ways', async () => {
    expect(isRef(ref1_to)).toBe(true);

    ref1.value = 1;

    await nextTick();

    expect(ref1_to.value).toBe(ref1.value);
    expect(ref1_from.value).toBe(0);
    expect(ref2_tofrom.value).toBe(ref1.value);

    ref1_to.value = 0;

    await nextTick();

    expect(ref1.value).toBe(1);
    expect(ref1_from.value).toBe(0);
    expect(ref2_tofrom.value).toBe(1);

    ref1_from.value = -1;

    await nextTick();

    expect(ref1.value).toBe(-1);
    expect(ref1_to.value).toBe(-1);
    expect(ref2_tofrom.value).toBe(-1);

    ref2_tofrom.value = 42;

    await nextTick();

    expect(ref1.value).toBe(42);
    expect(ref1_to.value).toBe(42);
    expect(ref1_from.value).toBe(-1);
  });

  it('processes empty map as simple `ref`', async () => {
    const simple = syncRef<number, number>(ref1, {} as any);

    expect(isRef(simple)).toBe(true);

    let prevVal = ref1.value;

    simple.value = 2;

    await nextTick();

    expect(2).not.toBe(prevVal);
    expect(ref1.value).toBe(prevVal);
    expect(simple.value).not.toBe(prevVal);

    prevVal = simple.value;
    ref1.value = 42;

    await nextTick();

    expect(42).not.toBe(prevVal);
    expect(ref1.value).not.toBe(prevVal);
    expect(simple.value).toBe(prevVal);
  });
});
