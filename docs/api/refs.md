# Ref interaction

## `fromRef`

```ts
// for vue refs
function fromRef<R>(ref: WatchSource<R>): Observable<R>;

// for reactive states
function fromRef<R extends Record<string, any>>(reactiveState: R): Observable<R>;
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
function syncRef<R1, R2 = R1>(
  ref1: Ref<R1>,
  map?: {
    to: (value: R1) => R2,
    from?: (value: R2) => R1,
  },
  ref2?: Ref<R2> | R2,
): Ref<R2>;
```

Creates a binding between two refs.\
The binding can be:
- One-way if only the `to` mapper is defined.
- Two-way if both `to` and `from` mappers are defined.

The second (resulting) ref serves as an origin point for the binding,\
values **from** the second ref and **to** the second ref are mapped onto it.

Example:
```ts
const count = ref(0);

// two-way binding
// Once count changes - countStr changes too
// and vice versa,
// according to the rules in the map.
const countStr = syncRef(count, { to: String, from: Number });

// one-way binding
// Once count changes - countInputStr changes too,
// according to the rules in the map.
// But if countInputStr changes - count stays the same
const countInputStr = syncRef(count, { to: String });
```

Every variable is exposed to `window`,\
so feel free to open the console and play with them!

<ClientOnly>
  <SyncRef/>
</ClientOnly>

```ts
count.value = 1;
console.log('countStr:', countStr.value);
//> 1
console.log('countInputStr:', countInputStr.value);
//> 1

countStr.value = 2;
console.log('count:', count.value);
//> 2
console.log('countInputStr:', countInputStr.value);
//> 2

countInputStr.value = 42;
console.log('count:', count.value);
//> 2
console.log('countStr:', countStr.value);
//> 2
```
