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
function syncRef<S extends Record<string, any>, K extends keyof S, R>(
  state: S,
  prop: K,
  map: (value: S[K]) => R,
  refValue?: Ref<R>
): Ref<R>;

function syncRef<S extends Record<string, any>, K extends keyof S>(
  state: S,
  prop: K,
  refValue?: Ref<S[K]>
): Ref<S[K]>;
```

Creates a one-side bind between a ref and a value from a reactive state.\
When the reactive state changes, the ref is updated, but not vice versa!

Example:
```ts
const state = reactive({
  count: 0
});

const count = syncRef(state, 'count');

// Ref is updated when state is changes
state.count = 1;
console.log('count:', count.value);
//> 1

// But not vice versa
count.value = 2;
console.log('state.count', state.count);
//> 1
```
