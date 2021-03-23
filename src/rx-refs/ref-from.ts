import { from, ObservableInput } from 'rxjs';
import { isProxy, Ref, ref, toRef, UnwrapRef } from 'vue';
import { untilUnmounted } from '../operators/until';

/**
 * Creates a ref from a promise.
 *
 * Once a promise is resolved, the ref is set to the resulting value.
 *
 * The ref will contain `undefined` until the promise is resolved.
 *
 * @param promise to set from
 */
export function refFrom<R>(promise: Promise<R>): Ref<UnwrapRef<R> | undefined>;

/**
 * Creates a ref from a promise.
 *
 * Once a promise is fulfilled, the ref is set to the resulting value.
 * Until then, the ref will contain the passed default value.
 *
 * @param promise to set from
 * @param defaultValue to set to the ref initially
 */
export function refFrom<R>(promise: Promise<R>, defaultValue: R): Ref<UnwrapRef<R>>;

/**
 * `refFrom` is not supposed to work for dynamic types and is recommended to use statically!
 *
 * But this overload is still allowed as a convenience.
 *
 * @param value a value to create the ref from
 */
export function refFrom<R>(arg: R): Ref<UnwrapRef<R>>;

/**
 * Creates a ref from an observable input.
 *
 * Behaves exactly like `from` in rxjs and creates an observable from the input.
 *
 * Once a resulting observable emits, the ref is set to the emitted value.
 *
 * The ref will contain `undefined` until the observable emits.
 *
 * @param observableInput an input to create an observable form and then listen to it
 */
export function refFrom<R>(obserableInput: ObservableInput<R>): Ref<UnwrapRef<R> | undefined>;

/**
 * Creates a ref from an observable input.
 *
 * Behaves exactly like `from` in rxjs and creates an observable from the input.
 *
 * Once a resulting observable emits, the ref is set to the emitted value.
 * Until then, the ref will contain the passed default value.
 *
 * @param observableInput an input to create an observable form and then listen to it
 * @param defaultValue to set to the ref initially
 */
export function refFrom<R>(obserableInput: ObservableInput<R>, defaultValue: R): Ref<UnwrapRef<R>>;

/**
 * Works exactly like toRef:
 * creates a ref from a reactive state.
 *
 * @param state a reactive state to bind from
 * @param key a key of the state to bind
 */
export function refFrom<R extends Record<any, any>, K extends keyof R>(state: R, key: K): Ref<UnwrapRef<R[K]>>;

/**
 * `refFrom` is not supposed to work for dynamic types and is recommended to use statically!
 *
 * But this overload is still allowed as a convenience.
 *
 * @param value a value to create the ref from
 */
export function refFrom<R>(arg: ObservableInput<R> | R): Ref<UnwrapRef<R> | undefined>;

/**
 * `refFrom` is not supposed to work for dynamic types and is recommended to use statically!
 *
 * But this overload is still allowed as a convenience.
 *
 * @param value a value to create the ref from
 * @param defaultValue to set to the ref initially
 */
export function refFrom<R>(arg: ObservableInput<R> | R, defaultValue: R): Ref<UnwrapRef<R>>;

export function refFrom(arg: unknown, subArg?: unknown) {
  if (typeof arg === 'object') try {
    const ref$ = ref(subArg);

    untilUnmounted(from(arg as any)).subscribe({
      next: value => ref$.value = value
    });

    return ref$;
  } catch (_) { /* Silence the error to try another ways */ }

  return isProxy(arg)
    ? toRef(arg as Record<any, any>, subArg)
    : ref(arg);
}
