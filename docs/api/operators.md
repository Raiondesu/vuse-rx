# Operators

`vuse-rx` also includes some operators that may come in handy when working with Vue.

[[toc]]

## `setRef`

```ts
<T>(ref: Ref<T>) => MonotypeOperatorFunction<T>
```

Sets a ref's value to current observable value.

```ts
import { setRef } from 'vuse-rx';

const result = ref(0);

from(Promise.resolve(42))
  // sets result of the promise to `result`
  .pipe(setRef(result))
  // equivalent to
  .pipe(tap(value => result.value = value))
  .subscribe();
```

Can be used in tandem with [`syncRef`](/api/refs.html#syncref):

```ts
import { setRef, syncRef } from 'vuse-rx';

const result = ref('some string to display to the user');

const displayValue = value => `New value is: ${value}`;

from(Promise.resolve(42))
  // sets result of the promise to `result`
  // but processed using display logic
  .pipe(setRef(syncRef(result, { from: displayValue })))
  .subscribe();

// wait for ref update
await nextTick();

// after observable emits:
console.log(result.value);
//> New value is 42
```

---

## `mapError`

Same as [`map`](https://rxjs.dev/api/index/function/map) in RxJS, but interacts with the `error` value of an observable.\
Accepts a callback similar to that of regular `map`.

```ts
import { tap } from 'rxjs/operators';
import { mapError } from 'vuse-rx';

from(Promise.reject('42'))
  .pipe(
    tap({ error: error => console.log('type of the error is', typeof error) }),
    mapError(Number),
    tap({ error: error => console.log('type of the error is', typeof error) }),
    tap({ error: error => console.log('error value is', error) }),
  )
  .subscribe({ error: e => console.log(e) });

// After promise rejects:
//> type of the error is string
//> type of the error is number
//> error value is 42
//> 42
```

---

## `pipeUntil`

```ts
<T>(hook: VueHook) => RxOperator<T>
```

Creates an operator that halts the observable when a Vue hook is activated.\
Only works for the component it is called within.

---

## `untilUnmounted`

```ts
<T>(obs: Observable<T>) => Observable<T>
```

An RxJS [operator](https://rxjs.dev/guide/operators).
Applies `pipeUntil` to an observable to dispose of it automatically when the component unmounts,\
shorthand for `obserable.pipe(pipeUntil(onUnmounted))`.

If it's awkward to apply an operator for this purpose, consider using [`useSubscription`](hooks#usesubscription) hook.
