# Operators

`vuse-rx` also includes some operators that may come in handy when working with Vue.

[[toc]]

## `setRef`

```ts
<T>(ref: Ref<T>) => MonotypeOperatorFunction<T, T>
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

## `mapError` and `tapError`

Same as `map` and `tap` in rxjs, but these interact with the `error` value of an observable.\
They both accept callbacks similar to those of regular `map` and `tap`.

```ts
import { mapError, tapError } from 'vuse-rx';

from(Promise.reject('42'))
  .pipe(
    mapError(Number),
    tapError(error => console.log('type of the error is', typeof error))
    tapError(error => console.log('error value is', error))
  )
  .subscribe({ error: e => console.log(e) });

// After promise rejects:
//> type of the error is number
//> error value is 42
//> 42
```
