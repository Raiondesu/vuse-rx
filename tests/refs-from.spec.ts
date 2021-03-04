import { refsFrom } from '../src/rx-refs/refs-from';

describe('refsFrom', () => {
  it('creates refs from observable input', async () => {
    const resolve = Promise.resolve(42);

    const resolveRefs = refsFrom(resolve);

    expect(resolveRefs.next.value).toBeUndefined();
    expect(resolveRefs.error.value).toBeUndefined();

    const resolved = await resolve;

    expect(resolveRefs.next.value).toBe(resolved);
    expect(resolveRefs.error.value).toBeUndefined();

    const reject = Promise.reject(42);
    const rejectRefs = refsFrom<never, number>(reject);

    expect(rejectRefs.next.value).toBeUndefined();
    expect(rejectRefs.error.value).toBeUndefined();

    try {
      const _ = await reject;
    } catch (rejected) {
      expect(rejectRefs.next.value).toBeUndefined();
      expect(rejectRefs.error.value).toBe(rejected);
    }
  });
})
