import { ObservableInput, from } from 'rxjs';
import { Ref, ref } from 'vue';

type Subscribers<R, E> = { next: R; error: E; };

type Refs<S extends Subscribers<any, any>> = {
  [key in keyof S]: Ref<S[key]>;
};

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
export function refsFrom<R, E>(input: ObservableInput<R>, defaultValues: Subscribers<R, E>): Refs<Subscribers<R, E>>;

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
export function refsFrom<R, E = unknown>(input: ObservableInput<R>, defaultValues: { next: R }): Refs<Subscribers<R, E | undefined>>;

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
export function refsFrom<R, E = unknown>(input: ObservableInput<R>): Refs<Subscribers<R | undefined, E | undefined>>;

export function refsFrom(input: ObservableInput<any>) {
  const next = ref();
  const error = ref();

  from(input).subscribe({
    next: v => next.value = v,
    error: v => error.value = v,
  });

  return { next, error };
}
