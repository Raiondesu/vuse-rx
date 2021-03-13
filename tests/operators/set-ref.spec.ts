import { from, Subject } from 'rxjs';
import { ref } from 'vue';
import { setRef } from '../../src/operators/set-ref';
import { syncRef } from '../../src/rx-refs/sync-ref';

describe('setRef', () => {
  it('sets a value to the ref', async () => {
    const refValue = ref(0);
    const $ = new Subject<number>();

    $.pipe(
      setRef(refValue)
    ).subscribe();

    $.next(42);

    expect(refValue.value).toBe(42);

    const result = ref('some string to display to the user');
    const promise = Promise.resolve(42);
    const displayValue = (value: number) => `New value is: ${value}`;

    from(promise)
      // sets result of the promise to `result`
      // but processed using display logic
      .pipe(setRef(syncRef.with({ flush: 'sync' })(result, { from: displayValue })))
      .subscribe();

    await promise;

    expect(result.value).toBe(displayValue(42));
  });
});
