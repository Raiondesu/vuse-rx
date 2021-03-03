import { Observable } from 'rxjs';
import { watch, WatchSource } from 'vue';
import { untilUnmounted } from '../hooks/until';

/**
 * Creates an observable from a vue ref.
 *
 * Each time a ref's value is changed - observable emits.
 *
 * Can also accept vue reactive objects and value factories.
 *
 * @param ref - a ref/reactive/factory to observe
 * @returns an observable that watches the ref
 */
export function fromRef<R>(ref: WatchSource<R>): Observable<R>;
export function fromRef<R extends Record<string, any>>(reactiveState: R): Observable<R>;
export function fromRef<R extends Record<string, any> | WatchSource<any>>(ref: R): Observable<R> {
  return untilUnmounted(
    new Observable<R>(ctx => watch(ref, value => ctx.next(value)))
  );
};
