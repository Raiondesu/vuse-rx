import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Same as [`map`](https://rxjs.dev/api/index/function/map) in RxJS, but interacts with the `error` value of an observable.\
 * Accepts a callback similar to that of regular `map`.
 */
export const mapError = <T, O, R>(cb: (e: T, $: Observable<O>) => R) => (
  catchError<O, Observable<O>>((e, $) => { throw cb(e, $); })
);
