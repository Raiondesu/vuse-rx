import { from } from 'rxjs';
import { tapError } from '../../src/operators/tap-error';

describe('tapError', () => {
  it('taps errors without modifying them', async () => {
    const value = '42';
    const fn = jest.fn(e => expect(e).toBe(value));
    const sub = jest.fn();

    const promise = Promise.reject(value);

    from(promise).pipe(
      tapError(fn)
    ).subscribe({
      error: e => {
        expect(typeof e).toBe(typeof value);
        expect(e).toBe(value);
        sub();
      }
    });

    try {
      await promise;
    } catch (e) { }

    expect(fn).toHaveBeenCalled();
    expect(sub).toHaveBeenCalled();
  });
});
