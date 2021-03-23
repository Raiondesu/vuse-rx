import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const mapError = <T, O, R>(cb: (e: T, $: Observable<O>) => R) => (
  catchError<O, Observable<O>>((e, $) => { throw cb(e, $); })
);
