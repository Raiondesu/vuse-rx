# Observable X Reactive

These are utilities that allow interoperability between RxJS' [observables](https://rxjs.dev/guide/observable) and Vue's [reactivity](https://vuejs.org/guide/essentials/reactivity-fundamentals.html).

[[toc]]

## `fromRef`

```ts
// for vue refs
function <R>(ref: WatchSource<R>, options?: WatchOptions): Observable<R>;

// for reactive states
function <R extends Record<string, any>>(reactiveState: R, options?: WatchOptions): Observable<R>;
```

Creates an observable from a vue ref.\
Each time a ref's value is changed - observable emits.\
Can also accept vue reactive objects and value factories.

```ts
const count = ref(0);

fromRef(count).subscribe(value => console.log('count is', value));

count.value = 42;
// logs
// > count is 42

count.value = 1;
// logs
// > count is 1
```

## `syncRef`

```ts
function <R1, R2 = R1>(
  ref: Ref<R1>,
  map: {
    to?: (value: R1) => R2,
    from?: (value: R2) => R1,
  },
  origin?: Ref<R2> | R2,
): SyncedRef<R2>;
```

Creates a binding between two refs.\
The binding can be:
- One-way if only one mapper is defined.
- Two-way if both mappers (`to` and `from`) are defined.

::: info
If specified, the second ref (`origin`) serves as an origin point for the binding as well as its default value,
i.e. values ***from*** `origin` are mapped onto `ref`
and mapped from `ref` ***to*** `origin`.
:::

### Simple example

::: tip
Every variable in this example is exposed to `window`,\
so feel free to open the console and play with it!
:::

<ClientOnly>
  <SyncRef/>
</ClientOnly>

::: code-group
```ts [count.ts]
import { ref } from 'vue';
import { syncRef } from 'vuse-rx';

const count = ref(0); // [!code focus]

// two-way binding
// Once `count` changes - `countStr` changes too
// and vice versa,
// according to the rules in the map.
const countStr = syncRef(count, { // [!code focus]
  // ref to bind ----------^ // [!code focus]
  to: String, // how to convert value when mapping to the resulting ref // [!code focus]
  from: Number // how to convert value when mapping from the resulting ref // [!code focus]
}); // [!code focus]

// one-way binding
// Once `countInputStr` changes - `count` changes too,
// according to the rules in the map.
// But if `count` changes - `countInputStr` stays the same
const countInputStr = syncRef(count, { from: Number }, ''); // [!code focus]
// default value (optional) ---------------------------^^
```

```vue [count.vue] {3}
<script lang="ts">
import { defineComponent } from 'vue';
import { count, countStr, countInputStr } from './count.ts';

export default defineComponent(() => ({ count, countStr, countInputStr }));
</script>

<template>
  <div>
    <code>count</code>
    <p>(original)</p>
    <button @click="count--">-</button>
    {{ count }}
    <button @click="count++">+</button>
  </div>
  <div>
    <code>countStr</code>
    <p>(two-way binding with count)</p>
    <input v-model="countStr">
  </div>
  <div>
    <code>countInputStr</code>
    <p>(one-way binding to count)</p>
    <input v-model="countInputStr">
  </div>
</template>
```
:::


### Options - `.with`

It's also possible to set the `WatchOptions` for `syncRef` using the `with` static method:

```ts
const customSyncRef = syncRef.with({
  // Don't wait for `nextTick`
  flush: 'sync',

  // Set the value from the first ref immediately
  immediate: true
});

// Use `.with` again on custom syncRef to add or rewrite watcg options
const deepSyncRef = customSyncRef.with({
  deep: true
});

/** The whole options for deepSyncRef are
 * {
 *   flush: 'sync',
 *   immediate: true,
 *   deep: true
 * }
 */
```

### Change ref bindings

Value returned from `syncRef` is, however,
different from your usual ref - it allows to control the bindings manually.
For each previously set direction (`from` or `to`), you can:
- Cut the binding (stop the watcher)\
  by `myRef.[direction].stop()`
- Restore the binding to the original ref without changes\
  by `myRef.[direction].bind()`
- Set the binding to a new ref with the same type\
  by `myRef.[direction].bind({ ref: newRef })`
- Set the binding to a new ref with a completely new type\
  by `myRef.[direction].bind({ ref: newTypeRef, map: mapperForNewType })`
- Set individual watch options for the binding\
  by `myRef.[direction].bind({ watch: { flush: 'sync' } })`

Where `[direction]` is either `from` or `to`.

::: code-group
```ts [to]
// Controls the incoming binding to this ref
countStr.to
// cuts the binding altogether
countStr.to.stop();
// Applies the binding to a new ref
countStr.to.bind({ ref: count });
// (may need to set a new map, if the ref type is different from before)
countStr.to.bind({
  ref: count,
  map: String,
  watch: { flush: 'sync' }
});
```
```ts [from]
// Controls the outcoming binding from this ref
countStr.from
// cuts the binding altogether
countStr.from.stop();
// Applies the binding to a new ref
countStr.from.bind({ ref: count });
// (may need to set a new map, if the ref type is different from before)
countStr.from.bind({
  ref: count,
  map: Number,
  watch: { immediate: true }
});
```
```ts [countStr definition]
const count = ref(0);

const countStr = syncRef(count, {
  to: String,
  from: Number
});
```
:::

::: tip
You can also play with the example above in the browser console.
:::

## `refFrom`

```ts
function <R>(obserableInput: ObservableInput<R>, defaultValue?: R): Ref<UnwrapRef<R>>;

function <R extends Record<any, any>, K extends keyof R>(state: R, key: K): Ref<UnwrapRef<R[K]>>;
```

Creates a ref from a couple of possible inputs.\
These include:
- `Promise`
- `Generator`
- `Iterable`
- `Observable`
- `Array`
- Vue's `Reactive`

::: tip
Will also work as a simple `ref` function as a safeguard or a convenience, in case it is given an unrecognizable value.
:::

## `refsFrom`

```ts
function <R, E = unknown>(
  input: ObservableInput<R>,
  defaultValues: { next: R, from: E },
): Refs<Subscribers<R, E>>;
```

Creates two refs from an observable input, same as [`refFrom`](#reffrom) (promise, iterable, observable and alike):
- `next` - is set when the observable emits
- `error` - is set when the observable errors

Until the observable emits, the refs will contain `undefined`,
if default values for the refs are not given as a second parameter.

::: code-group
```vue [Example.vue]
<script setup>
import { refsFrom } from 'vuse-rx';

// Suppose we have some function that either returns a promise or rejects it:
declare function getPage(id: string): Promise<{ content: string }>;

// Using `refsFrom` we can process both the success and error cases
// without the need for try/then/catch!

const { next: content, error } = refsFrom( // [!code focus]
  getPage('raiondesu') // [!code focus]
    // Extract content first // [!code focus]
    .then(obj => obj.content) // [!code focus]
); // [!code focus]

</script>
<template>
  <div v-show="!!content" v-html="content"></div> // [!code focus]
  <p v-show="!!error">Couldn't load page: {{ error }}!</p> // [!code focus]
</template>
```
:::
