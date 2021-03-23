import { ObservableInput, from, Subscription, Observable } from 'rxjs';
import { Ref, ref } from 'vue';
import { untilUnmounted } from '../operators/until';

type Subscribers<R, E> = { next: R; error: E; };

type Refs<R, E> = {
  [key in keyof Subscribers<R, E>]: Ref<Subscribers<R, E>[key]>;
} & {
  subscription: Subscription;
  value$: Observable<R>;
};

/**
 * Creates two refs from an observable input (promise, iterable, observable and alike):
 * - `next` - is set when the resulting observable resolves
 * - `error` - is set when the resulting observable errors
 *
 * Until the observable emits, the refs will contain `undefined`.
 *
 * @param input
 * A value to create an observable from.\
 * This observable is then going to be listened to in order to set the refs.
 */
export function refsFrom<R, E = unknown>(input: ObservableInput<R>): Refs<R | undefined, E | undefined>;

/**
 * Creates two refs from an observable input (promise, iterable, observable and alike):
 * - `next` - is set when the resulting observable resolves
 * - `error` - is set when the resulting observable errors
 *
 * @param input
 * A value to create an observable from.\
 * This observable is then going to be listened to in order to set the refs.
 *
 * @param defaultValues
 * A map of default values for each ref.
 */
export function refsFrom<R, E = unknown>(input: ObservableInput<R>, defaultValues: { next: R }): Refs<R, E | undefined>;

/**
 * Creates two refs from an observable input (promise, iterable, observable and alike):
 * - `next` - is set when the resulting observable resolves
 * - `error` - is set when the resulting observable errors
 *
 * @param input
 * A value to create an observable from.\
 * This observable is then going to be listened to in order to set the refs.
 *
 * @param defaultValues
 * A map of default values for each ref.
 */
export function refsFrom<R, E>(input: ObservableInput<R>, defaultValues: Subscribers<R, E>): Refs<R, E>;

export function refsFrom(input: ObservableInput<any>, defaultValues: Partial<Subscribers<any, any>> = {}) {
  const next = ref(defaultValues.next);
  const error = ref(defaultValues.error);
  const value$ = untilUnmounted(from(input));

  return {
    next,
    error,
    value$,
    subscription: value$.subscribe({
      next: v => next.value = v,
      error: v => error.value = v,
    })
  };
}
