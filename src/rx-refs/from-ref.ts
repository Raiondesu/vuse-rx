import { Observable } from 'rxjs';
import { watch, WatchOptions, WatchSource } from 'vue';
import { untilUnmounted } from '../operators/until';

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
export function fromRef<R>(ref: WatchSource<R>, options?: WatchOptions): Observable<R>;

/**
 * Creates an observable from a vue reactive state.
 *
 * Each time a state's value is changed - observable emits.
 *
 * @param ref - a reactive state to observe
 * @returns an observable that watches the state
 */
export function fromRef<R extends Record<string, any>>(reactiveState: R, options?: WatchOptions): Observable<R>;
export function fromRef(ref: Record<string, unknown> | WatchSource<unknown>): Observable<unknown> {
  return untilUnmounted(
    new Observable(ctx => watch(ref, value => ctx.next(value)))
  );
};
