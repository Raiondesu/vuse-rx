import { from } from 'rxjs';
import { mapError } from '../../src/operators/map-error';

describe('mapError', () => {
  it('maps errors to new values', async () => {
    const fn = jest.fn(mapper => e => mapper(e));
    const sub = jest.fn();

    const promise = Promise.reject('42');

    from(promise).pipe(
      mapError(fn(Number))
    ).subscribe({
      error: e => {
        expect(typeof e).toBe('number');
        expect(e).toBe(42);
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
