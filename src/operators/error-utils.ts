import type { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const createErrorOperator = (
  operation: (e: any, $: Observable<any>, cb: (e: any, $: Observable<any>) => any) => void
) => <T, O, R>(cb: (e: T, $: Observable<O>) => R) => (
  catchError<O, Observable<O>>((e, $) => { throw operation(e, $, cb); })
);
